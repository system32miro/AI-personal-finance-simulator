import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, AlertTriangle, TrendingUp, RefreshCw } from "lucide-react";
import { analyzeFinances } from "@/integrations/groq/client";
import { useToast } from "@/hooks/use-toast";

interface AIAnalysisProps {
    transactions: any[];
    stats: any;
}

export default function AIAnalysis({ transactions, stats }: AIAnalysisProps) {
    const [analysis, setAnalysis] = useState<{
        insights: string[];
        recommendations: string[];
        alerts: string[];
    }>({
        insights: [],
        recommendations: [],
        alerts: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const fetchAnalysis = async () => {
        setIsLoading(true);
        try {
            const result = await analyzeFinances(transactions, stats);
            setAnalysis(result);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro na análise",
                description: "Não foi possível gerar a análise financeira.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (transactions.length > 0) {
            fetchAnalysis();
        }
    }, [transactions]);

    return (
        <Card className="max-h-[500px] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-background z-10 pb-2">
                <CardTitle>Análise Inteligente</CardTitle>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchAnalysis}
                    disabled={isLoading}
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Atualizar
                </Button>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
                {isLoading ? (
                    <div className="text-center text-muted-foreground py-4">
                        A analisar os seus dados financeiros...
                    </div>
                ) : (
                    <>
                        {analysis.insights.length > 0 && (
                            <div className="space-y-1.5">
                                <div className="flex items-center text-primary">
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                    <h3 className="font-medium">Análises</h3>
                                </div>
                                <ul className="text-sm space-y-1">
                                    {analysis.insights.map((insight, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span className="text-sm leading-tight">{insight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {analysis.recommendations.length > 0 && (
                            <div className="space-y-1.5">
                                <div className="flex items-center text-emerald-500">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    <h3 className="font-medium">Sugestões</h3>
                                </div>
                                <ul className="text-sm space-y-1">
                                    {analysis.recommendations.map((recommendation, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span className="text-sm leading-tight">{recommendation}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {analysis.alerts.length > 0 && (
                            <div className="space-y-1.5">
                                <div className="flex items-center text-red-500">
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    <h3 className="font-medium">Alertas</h3>
                                </div>
                                <ul className="text-sm space-y-1">
                                    {analysis.alerts.map((alert, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span className="text-sm leading-tight">{alert}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
} 