import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AuthCallback() {
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const handleAuthCallback = async () => {
            const { error } = await supabase.auth.getSession();

            if (error) {
                toast({
                    variant: "destructive",
                    title: "Erro na autenticação",
                    description: "Não foi possível confirmar a tua conta. Por favor, tenta novamente.",
                });
                navigate("/auth");
                return;
            }

            toast({
                title: "Conta confirmada",
                description: "A tua conta foi confirmada com sucesso!",
            });
            navigate("/dashboard");
        };

        handleAuthCallback();
    }, [navigate, toast]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">A confirmar a tua conta...</h2>
                <p className="text-muted-foreground">Por favor, aguarda um momento.</p>
            </div>
        </div>
    );
} 