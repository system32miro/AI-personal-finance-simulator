import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2, Check, X } from "lucide-react";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") === "login");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Validação de força da senha
  const hasMinLength = password.length >= 6;
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const passwordsMatch = password === confirmPassword;

  const isPasswordStrong = hasMinLength && hasNumber && hasSpecialChar && hasUpperCase;
  const canSubmit = isLogin
    ? email && password
    : email && password && passwordsMatch && isPasswordStrong;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && !passwordsMatch) {
      toast({
        variant: "destructive",
        title: "Erro na validação",
        description: "As palavras-passe não coincidem.",
      });
      return;
    }

    let retryCount = 0;
    const tryAuth = async (): Promise<any> => {
      try {
        if (isLogin) {
          console.log(`Tentativa de login ${retryCount + 1}/${MAX_RETRIES}`);
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          return { data, error };
        } else {
          console.log(`Tentativa de criar conta ${retryCount + 1}/${MAX_RETRIES}`);
          return await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
              data: {
                first_name: firstName,
                last_name: lastName,
              }
            },
          });
        }
      } catch (error: any) {
        console.error(`Erro na tentativa ${retryCount + 1}:`, error);
        if (retryCount < MAX_RETRIES - 1 && error.message?.includes('fetch')) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return tryAuth();
        }
        throw error;
      }
    };

    try {
      setIsLoading(true);
      const { data, error } = await tryAuth();

      if (error) {
        console.error('Erro final:', error);
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Email ou palavra-passe incorretos. Por favor, verifica os dados e tenta novamente.");
        } else if (error.message.includes("Email not confirmed")) {
          throw new Error("Por favor, confirma o teu email antes de fazer login. Verifica a tua caixa de entrada.");
        } else {
          throw error;
        }
      }

      if (isLogin) {
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta!",
        });

        setIsRedirecting(true);
        setTimeout(() => {
          window.scrollTo(0, 0);
          navigate("/dashboard");
        }, 500);
      } else if (data?.user) {
        try {
          const { error: profileError } = await supabase
            .from("user_profiles")
            .upsert({
              id: data.user.id,
              first_name: firstName,
              last_name: lastName,
              preferred_currency: "EUR",
              theme: "light",
              language: "pt",
              email_notifications: true,
              push_notifications: true,
              updated_at: new Date().toISOString()
            });

          if (profileError) throw profileError;

          toast({
            title: "Conta criada com sucesso",
            description: "Enviámos um email de confirmação. Por favor, verifica a tua caixa de entrada e segue as instruções.",
          });
        } catch (profileError: any) {
          console.error('Erro ao criar perfil:', profileError);
          toast({
            variant: "destructive",
            title: "Erro ao criar perfil",
            description: "A conta foi criada mas houve um erro ao configurar o perfil. Por favor, tenta fazer login.",
          });
        }
      }
    } catch (error: any) {
      console.error('Erro final:', error);
      toast({
        variant: "destructive",
        title: isLogin ? "Erro ao entrar" : "Erro ao criar conta",
        description: error.message || "Ocorreu um erro. Por favor, tenta novamente.",
      });
    } finally {
      setIsLoading(false);
      setIsRedirecting(false);
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20 transition-opacity duration-500 ${isRedirecting ? 'opacity-0' : 'opacity-100'}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">
            {isLogin ? "Entrar na conta" : "Criar conta"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Entre com sua conta para continuar"
              : "Crie sua conta para começar a controlar suas finanças"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Primeiro Nome</Label>
                      <Input
                        id="firstName"
                        placeholder="João"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required={!isLogin}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Último Nome</Label>
                      <Input
                        id="lastName"
                        placeholder="Silva"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Palavra-passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                {!isLogin && (
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {hasMinLength ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                      <span>Mínimo de 6 caracteres</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasUpperCase ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                      <span>Pelo menos uma letra maiúscula</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasNumber ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                      <span>Pelo menos um número</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasSpecialChar ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                      <span>Pelo menos um caractere especial</span>
                    </div>
                  </div>
                )}
              </div>
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar palavra-passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {confirmPassword && (
                    <div className="flex items-center gap-2 text-sm">
                      {passwordsMatch ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                      <span className={passwordsMatch ? "text-green-500" : "text-red-500"}>
                        {passwordsMatch ? "As palavras-passe coincidem" : "As palavras-passe não coincidem"}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !canSubmit}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                {isLogin ? "Entrar" : "Criar conta"}
              </Button>
            </form>

            <div className="text-center text-sm space-y-2">
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={handleToggleMode}
              >
                {isLogin
                  ? "Não tem uma conta? Crie aqui"
                  : "Já tem uma conta? Entre aqui"}
              </button>
              {isLogin && (
                <div>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-primary hover:underline"
                    onClick={() => navigate("/auth/reset-password")}
                  >
                    Esqueceste a palavra-passe?
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
