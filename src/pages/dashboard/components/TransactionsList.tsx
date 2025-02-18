import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TransactionDialog from "./TransactionDialog";

interface TransactionsListProps {
  onTransactionUpdate: () => void;
  filters: {
    search: string;
    category: string;
    dateRange: {
      from: Date;
      to: Date;
    };
  };
  categories: string[];
}

const ITEMS_PER_PAGE = 5;

export default function TransactionsList({ onTransactionUpdate, filters, categories }: TransactionsListProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Primeiro, obter o total de registros
      let countQuery = supabase
        .from("transactions")
        .select("*", { count: "exact" })
        .eq("user_id", session.user.id)
        .gte("date", filters.dateRange.from.toISOString())
        .lte("date", filters.dateRange.to.toISOString());

      if (filters.category) {
        countQuery = countQuery.eq("category", filters.category);
      }

      if (filters.search) {
        countQuery = countQuery.ilike("description", `%${filters.search}%`);
      }

      const { count, error: countError } = await countQuery;

      if (countError) throw countError;
      setTotalCount(count || 0);

      // Depois, buscar os dados paginados
      let query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", session.user.id)
        .gte("date", filters.dateRange.from.toISOString())
        .lte("date", filters.dateRange.to.toISOString())
        .order("date", { ascending: false })
        .range(currentPage * ITEMS_PER_PAGE, (currentPage * ITEMS_PER_PAGE) + ITEMS_PER_PAGE - 1);

      if (filters.category) {
        query = query.eq("category", filters.category);
      }

      if (filters.search) {
        query = query.ilike("description", `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar transações",
        description: "Não foi possível carregar as transações.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(0); // Reset para primeira página quando os filtros mudam
    fetchTransactions();
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Transação removida",
        description: "A transação foi removida com sucesso.",
      });

      fetchTransactions();
      onTransactionUpdate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao remover transação",
        description: "Não foi possível remover a transação.",
      });
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        A carregar transações...
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Nenhuma transação encontrada para os filtros selecionados.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium">Data</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Descrição</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Categoria</th>
                <th className="h-12 px-4 text-right align-middle font-medium">Valor</th>
                <th className="h-12 px-4 align-middle font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <td className="p-4 align-middle">
                    {format(new Date(transaction.date), "dd/MM/yyyy")}
                  </td>
                  <td className="p-4 align-middle">{transaction.description}</td>
                  <td className="p-4 align-middle">{transaction.category}</td>
                  <td className={`p-4 align-middle text-right ${transaction.type === "income" ? "text-emerald-500" : "text-red-500"
                    }`}>
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingTransaction(transaction)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2 border-t">
            <div className="text-sm text-muted-foreground">
              Página {currentPage + 1} de {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <TransactionDialog
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
        transaction={editingTransaction}
        onSuccess={() => {
          setEditingTransaction(null);
          fetchTransactions();
          onTransactionUpdate();
        }}
        categories={categories}
      />
    </>
  );
}
