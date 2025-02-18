import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Goal {
    id: string;
    name: string;
    current_amount: number;
    target_amount: number;
    color: string;
}

interface GoalFormData {
    name: string;
    target_amount: string;
    current_amount: string;
    color: string;
}

export default function FinancialGoals() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [formData, setFormData] = useState<GoalFormData>({
        name: "",
        target_amount: "",
        current_amount: "",
        color: "bg-blue-500"
    });
    const { toast } = useToast();

    const fetchGoals = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const { data, error } = await supabase
                .from("financial_goals")
                .select("*")
                .order("created_at", { ascending: true });

            if (error) throw error;
            setGoals(data || []);
        } catch (error) {
            console.error("Error fetching goals:", error);
            toast({
                variant: "destructive",
                title: "Erro ao carregar metas",
                description: "Não foi possível carregar as suas metas financeiras.",
            });
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleOpenDialog = (goal?: Goal) => {
        if (goal) {
            setEditingGoal(goal);
            setFormData({
                name: goal.name,
                target_amount: String(goal.target_amount),
                current_amount: String(goal.current_amount),
                color: goal.color
            });
        } else {
            setEditingGoal(null);
            setFormData({
                name: "",
                target_amount: "",
                current_amount: "0",
                color: "bg-blue-500"
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const goalData = {
                name: formData.name,
                target_amount: Number(formData.target_amount),
                current_amount: Number(formData.current_amount),
                color: formData.color,
                user_id: session.user.id
            };

            if (editingGoal) {
                const { error } = await supabase
                    .from("financial_goals")
                    .update(goalData)
                    .eq("id", editingGoal.id);

                if (error) throw error;
                toast({
                    title: "Meta atualizada",
                    description: "A meta foi atualizada com sucesso!",
                });
            } else {
                const { error } = await supabase
                    .from("financial_goals")
                    .insert([goalData]);

                if (error) throw error;
                toast({
                    title: "Meta criada",
                    description: "A meta foi criada com sucesso!",
                });
            }

            setIsDialogOpen(false);
            fetchGoals();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro ao salvar meta",
                description: "Não foi possível salvar a meta financeira.",
            });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from("financial_goals")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast({
                title: "Meta removida",
                description: "A meta foi removida com sucesso!",
            });
            fetchGoals();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro ao remover meta",
                description: "Não foi possível remover a meta financeira.",
            });
        }
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Metas Financeiras</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleOpenDialog()}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Nova Meta
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {goals.length === 0 ? (
                        <p className="text-center text-muted-foreground">
                            Nenhuma meta definida. Clique em "Nova Meta" para começar!
                        </p>
                    ) : (
                        goals.map((goal) => {
                            const progress = (goal.current_amount / goal.target_amount) * 100;
                            return (
                                <div key={goal.id} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{goal.name}</span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenDialog(goal)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(goal.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>
                                            {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                                        </span>
                                        <span>{progress.toFixed(1)}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2" indicatorClassName={goal.color} />
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingGoal ? "Editar Meta" : "Nova Meta"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome da Meta</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="target">Valor Objetivo</Label>
                            <Input
                                id="target"
                                type="number"
                                step="0.01"
                                value={formData.target_amount}
                                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="current">Valor Atual</Label>
                            <Input
                                id="current"
                                type="number"
                                step="0.01"
                                value={formData.current_amount}
                                onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Cor</Label>
                            <div className="flex gap-2">
                                {["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"].map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={`w-8 h-8 rounded-full ${color} ${formData.color === color ? "ring-2 ring-offset-2 ring-primary" : ""
                                            }`}
                                        onClick={() => setFormData({ ...formData, color })}
                                    />
                                ))}
                            </div>
                        </div>
                        <Button type="submit" className="w-full">
                            {editingGoal ? "Atualizar" : "Criar"} Meta
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
} 