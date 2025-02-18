import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, RefreshCw } from "lucide-react";
import { analyzeFinances } from "@/integrations/groq/client";

interface Message {
    role: "assistant" | "user";
    content: string;
}

interface AIChatProps {
    transactions: any[];
    stats: any;
}

export default function AIChat({ transactions, stats }: AIChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Olá! Sou o teu assistente financeiro. Como posso ajudar-te?"
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleReset = () => {
        setMessages([
            {
                role: "assistant",
                content: "Olá! Sou o teu assistente financeiro. Como posso ajudar-te?"
            }
        ]);
        setInput("");
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const context = `
                Contexto atual:
                - Saldo total: ${stats.totalBalance}
                - Receitas do mês: ${stats.monthlyIncome}
                - Despesas do mês: ${stats.monthlyExpenses}
                - Número de transações: ${transactions.length}
                
                Pergunta do utilizador: ${userMessage}
            `;

            const response = await analyzeFinances(transactions, stats, context);

            setMessages(prev => [...prev, {
                role: "assistant",
                content: response.answer || "Lamento, não consegui processar a tua pergunta."
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Lamento, ocorreu um erro ao processar a tua pergunta."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-medium">Chat Financeiro</CardTitle>
                    {isLoading && <Bot className="w-4 h-4 animate-pulse text-primary" />}
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleReset}
                    title="Reiniciar conversa"
                >
                    <RefreshCw className="w-4 h-4" />
                </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                <ScrollArea className="flex-1">
                    <div className="flex flex-col gap-4 p-4 min-h-full">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-2 ${message.role === "assistant" ? "justify-start" : "justify-end"
                                    }`}
                            >
                                {message.role === "assistant" && (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Bot className="w-5 h-5 text-primary" />
                                    </div>
                                )}
                                <div
                                    className={`rounded-lg px-4 py-2 max-w-[85%] shadow-sm ${message.role === "assistant"
                                            ? "bg-muted"
                                            : "bg-primary text-primary-foreground"
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                </div>
                                {message.role === "user" && (
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                                        <User className="w-5 h-5 text-primary-foreground" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Bot className="w-5 h-5 text-primary animate-pulse" />
                                </div>
                                <div className="bg-muted rounded-lg px-4 py-2">
                                    <p className="text-sm text-muted-foreground">A processar...</p>
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
                <div className="p-4 border-t mt-auto">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className="flex gap-2"
                    >
                        <Input
                            placeholder="Faz uma pergunta sobre as tuas finanças..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !input.trim()}
                            className="shrink-0"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
} 