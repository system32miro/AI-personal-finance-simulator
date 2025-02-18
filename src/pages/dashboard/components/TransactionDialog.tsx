
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Icons } from "@/components/ui/icons";
import { format } from "date-fns";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  user_id: string;
}

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  transaction?: Transaction | null;
  categories: string[];
}

export default function TransactionDialog({ 
  open, 
  onOpenChange, 
  onSuccess, 
  transaction,
  categories 
}: TransactionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setAmount(String(transaction.amount));
      setType(transaction.type);
      setCategory(transaction.category);
      setDate(format(new Date(transaction.date), "yyyy-MM-dd"));
    } else {
      setDescription("");
      setAmount("");
      setType("expense");
      setCategory("");
      setDate(format(new Date(), "yyyy-MM-dd"));
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar transação",
        description: "Usuário não autenticado",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      if (transaction) {
        const { error } = await supabase
          .from("transactions")
          .update({
            description,
            amount: Number(amount),
            type,
            category,
            date,
          })
          .eq("id", transaction.id);

        if (error) throw error;

        toast({
          title: "Transação atualizada",
          description: "Sua transação foi atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from("transactions")
          .insert({
            description,
            amount: Number(amount),
            type,
            category,
            date,
            user_id: userId,
          });

        if (error) throw error;

        toast({
          title: "Transação criada",
          description: "Sua transação foi registrada com sucesso!",
        });
      }

      onOpenChange(false);
      onSuccess?.();
      
      if (!transaction) {
        setDescription("");
        setAmount("");
        setType("expense");
        setCategory("");
        setDate(format(new Date(), "yyyy-MM-dd"));
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar transação",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Editar Transação" : "Nova Transação"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={(value: "income" | "expense") => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            {transaction ? "Atualizar" : "Salvar"} Transação
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
