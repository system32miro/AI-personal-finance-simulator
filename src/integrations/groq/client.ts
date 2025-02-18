import { Groq } from "groq-sdk";

const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;

if (!groqApiKey) {
    throw new Error('Falta a chave de API do Groq nas variáveis de ambiente');
}

const groq = new Groq({
    apiKey: groqApiKey,
    dangerouslyAllowBrowser: true
});

interface FinancialAnalysis {
    insights: string[];
    recommendations: string[];
    alerts: string[];
    answer?: string;
}

export async function analyzeFinances(
    transactions: any[],
    stats: any,
    context?: string
): Promise<FinancialAnalysis> {
    const systemPrompt = `És um assistente financeiro português especializado em finanças pessoais.
    Deves SEMPRE:
    - Usar português de Portugal (não brasileiro)
    - Usar "tu" em vez de "você"
    - Usar termos comuns em Portugal:
      * "despesas" em vez de "gastos"
      * "habitação" em vez de "moradia"
      * "transportes" em vez de "transporte"
      * "valor" em vez de "quantia"
      * "comboio" em vez de "trem"
      * "autocarro" em vez de "ônibus"
      * "casa de banho" em vez de "banheiro"
      * "pequeno-almoço" em vez de "café da manhã"
      * "telemóvel" em vez de "celular"
    - Ser direto e prático nas respostas
    - Fornecer análises acionáveis
    - Manter um tom profissional mas amigável`;

    const basePrompt = context ? context : `
        Como analista financeiro, analisa os seguintes dados financeiros e fornece insights, recomendações e alertas:
        
        Transações: ${JSON.stringify(transactions)}
        Estatísticas: ${JSON.stringify(stats)}
        
        Por favor, fornece em português de Portugal:
        1. 3-5 análises sobre os padrões de despesas e tendências
        2. 3-5 sugestões específicas para melhorar a saúde financeira
        3. Alertas importantes sobre despesas excessivas ou padrões preocupantes
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: basePrompt
                }
            ],
            model: "mixtral-8x7b-32768",
            temperature: 0.7,
            max_tokens: 1024,
        });

        const response = completion.choices[0]?.message?.content || "{}";

        if (context) {
            return {
                insights: [],
                recommendations: [],
                alerts: [],
                answer: response
            };
        }

        const parsedResponse = JSON.parse(response);
        return {
            insights: parsedResponse.insights || [],
            recommendations: parsedResponse.recommendations || [],
            alerts: parsedResponse.alerts || []
        };
    } catch (error) {
        console.error("Erro na análise da IA:", error);
        if (context) {
            return {
                insights: [],
                recommendations: [],
                alerts: [],
                answer: "Lamento, mas não foi possível processar a tua pergunta neste momento."
            };
        }
        return {
            insights: ["Não foi possível gerar análises neste momento."],
            recommendations: ["Tenta novamente mais tarde."],
            alerts: []
        };
    }
} 