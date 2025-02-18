import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, ArrowLeft, Check, X } from "lucide-react";

export default function ResetPassword() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Verificar se temos um token de recuperação
    const type = searchParams.get("type");
    const hasToken = type === "recovery";

    useEffect(() => {
        // Se tivermos um token, verificar a sessão
        if (hasToken) {
            const checkSession = async () => {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error || !session) {
                    toast({
                        variant: "destructive",
                        title: "Sessão inválida",
                        description: "O link de recuperação expirou ou é inválido.",
                    });
                    navigate("/auth");
                }
            };
            checkSession();
        }
    }, [hasToken, navigate]);

    // Validação de força da senha
    const hasMinLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const passwordsMatch = password === confirmPassword;
    const isPasswordStrong = hasMinLength && hasNumber && hasSpecialChar && hasUpperCase;

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password?type=recovery`,
            });

            if (error) throw error;

            toast({
                title: "Email enviado",
                description: "Verifica a tua caixa de entrada para redefinir a palavra-passe.",
            });

            setTimeout(() => navigate("/auth"), 2000);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao enviar email",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordsMatch) {
            toast({
                variant: "destructive",
                title: "Erro na validação",
                description: "As palavras-passe não coincidem.",
            });
            return;
        }

        if (!isPasswordStrong) {
            toast({
                variant: "destructive",
                title: "Palavra-passe fraca",
                description: "A palavra-passe não cumpre os requisitos mínimos.",
            });
            return;
        }

        try {
            setIsLoading(true);
            const { error } = await supabase.auth.updateUser({ password });

            if (error) throw error;

            toast({
                title: "Palavra-passe atualizada",
                description: "A tua palavra-passe foi atualizada com sucesso.",
            });

            // Fazer logout para forçar novo login com a nova password
            await supabase.auth.signOut();
            setTimeout(() => navigate("/auth"), 2000);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao atualizar palavra-passe",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/auth")}
                            className="rounded-full"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <CardTitle className="text-2xl font-bold">
                            {hasToken ? "Redefinir palavra-passe" : "Recuperar conta"}
                        </CardTitle>
                    </div>
                    <CardDescription>
                        {hasToken
                            ? "Insere a tua nova palavra-passe"
                            : "Insere o teu email para receber instruções de recuperação"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={hasToken ? handlePasswordReset : handleResetRequest} className="space-y-4">
                        {!hasToken ? (
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
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Nova palavra-passe</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
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
                                </div>
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
                            </>
                        )}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || (hasToken && (!isPasswordStrong || !passwordsMatch))}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Mail className="w-4 h-4 mr-2" />
                            )}
                            {hasToken ? "Atualizar palavra-passe" : "Enviar email de recuperação"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 