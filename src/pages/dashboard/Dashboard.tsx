import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  PlusCircle,
  LogOut,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Calendar,
  Search,
  ArrowUp,
  ArrowDown,
  Download
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { format, subDays, startOfWeek, startOfMonth, startOfYear } from "date-fns";
import { pt } from "date-fns/locale";
import TransactionsList from "./components/TransactionsList";
import TransactionDialog from "./components/TransactionDialog";
import TransactionsChart from "./components/TransactionsChart";
import { DateRangePicker } from "./components/DateRangePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FinancialGoals from "./components/FinancialGoals";
import Papa from "papaparse";
import AIAnalysis from "./components/AIAnalysis";
import AIChat from "./components/AIChat";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  previousMonthIncome: number;
  previousMonthExpenses: number;
}

const CATEGORIES = [
  "Alimentação",
  "Transportes",
  "Habitação",
  "Saúde",
  "Educação",
  "Lazer",
  "Outros"
];

const TIME_RANGES = [
  {
    label: "Hoje",
    value: "today",
    getRange: () => {
      const today = new Date();
      return { from: today, to: today };
    }
  },
  {
    label: "Esta Semana",
    value: "week",
    getRange: () => {
      const today = new Date();
      return {
        from: startOfWeek(today, { locale: pt }),
        to: today
      };
    }
  },
  {
    label: "Este Mês",
    value: "month",
    getRange: () => {
      const today = new Date();
      return {
        from: startOfMonth(today),
        to: today
      };
    }
  },
  {
    label: "Este Ano",
    value: "year",
    getRange: () => {
      const today = new Date();
      return {
        from: startOfYear(today),
        to: today
      };
    }
  }
];

export default function Dashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    previousMonthIncome: 0,
    previousMonthExpenses: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState("month");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Garantir que a página começa no topo
    window.scrollTo(0, 0);

    // Simular um pequeno carregamento para uma transição mais suave
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      setIsLoading(true);
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const firstDayOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const lastDayOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", session.user.id)
        .gte("date", firstDayOfPreviousMonth.toISOString());

      if (error) throw error;

      const currentMonthTransactions = transactions.filter(t =>
        new Date(t.date) >= firstDayOfMonth
      );

      const previousMonthTransactions = transactions.filter(t =>
        new Date(t.date) >= firstDayOfPreviousMonth &&
        new Date(t.date) <= lastDayOfPreviousMonth
      );

      const monthlyIncome = currentMonthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const monthlyExpenses = currentMonthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const previousMonthIncome = previousMonthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const previousMonthExpenses = previousMonthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalBalance = transactions.reduce((sum, t) => {
        return sum + (t.type === "income" ? Number(t.amount) : -Number(t.amount));
      }, 0);

      setStats({
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        previousMonthIncome,
        previousMonthExpenses
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível atualizar o painel.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      setIsLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", session.user.id)
        .gte("date", dateRange.from!.toISOString())
        .lte("date", (dateRange.to || dateRange.from)!.toISOString());

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar transações",
        description: "Não foi possível atualizar as transações.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchDashboardStats();
    fetchTransactions();
  }, [dateRange]);

  const handleSignOut = useCallback(async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Não foi possível terminar a sessão.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTimeRangeChange = useCallback((value: string) => {
    const range = TIME_RANGES.find(r => r.value === value)?.getRange();
    if (range) {
      setSelectedTimeRange(value);
      setDateRange(range);
    }
  }, []);

  const handleExportData = useCallback(() => {
    if (transactions.length === 0) {
      toast({
        variant: "destructive",
        title: "Sem dados para exportar",
        description: "Não existem transações no período selecionado.",
      });
      return;
    }

    const csvContent = transactions.map(t => ({
      Data: format(new Date(t.date), "dd/MM/yyyy"),
      Descrição: t.description,
      Categoria: t.category,
      Tipo: t.type === "income" ? "Receita" : "Despesa",
      Valor: formatCurrency(t.amount)
    }));

    const csv = Papa.unparse(csvContent);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `transacoes_${format(dateRange.from!, "yyyy-MM-dd")}.csv`;
    link.click();

    toast({
      title: "Exportação concluída",
      description: "Os dados foram exportados com sucesso.",
    });
  }, [transactions, dateRange]);

  const handleTransactionUpdate = useCallback(() => {
    fetchDashboardStats();
    fetchTransactions();
  }, [fetchDashboardStats, fetchTransactions]);

  // Memoize filtered transactions for better performance
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (selectedCategory !== "all" && t.category !== selectedCategory) return false;
      if (searchTerm && !t.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [transactions, selectedCategory, searchTerm]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Painel Financeiro</h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-2 w-full sm:w-auto">
            {TIME_RANGES.map(range => (
              <TooltipProvider key={range.value}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={selectedTimeRange === range.value ? "default" : "outline"}
                      onClick={() => handleTimeRangeChange(range.value)}
                      className="whitespace-nowrap"
                    >
                      {range.label}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ver transações de {range.label.toLowerCase()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleExportData}
                    className="flex-1 sm:flex-none"
                    disabled={transactions.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exportar transações para CSV</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handleSignOut} className="flex-1 sm:flex-none">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Terminar sessão</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.totalBalance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-emerald-500">
              {formatCurrency(stats.monthlyIncome)}
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              {stats.monthlyIncome > stats.previousMonthIncome ? (
                <ArrowUp className="w-3 h-3 text-emerald-500 mr-1" />
              ) : (
                <ArrowDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              vs {formatCurrency(stats.previousMonthIncome)} mês anterior
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-500">
              {formatCurrency(stats.monthlyExpenses)}
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              {stats.monthlyExpenses > stats.previousMonthExpenses ? (
                <ArrowUp className="w-3 h-3 text-red-500 mr-1" />
              ) : (
                <ArrowDown className="w-3 h-3 text-emerald-500 mr-1" />
              )}
              vs {formatCurrency(stats.previousMonthExpenses)} mês anterior
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <CardTitle>Transações Recentes</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-1 h-4 w-4" />
              Últimas transações
            </div>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
            <PlusCircle className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="w-full sm:w-1/3">
                <DateRangePicker date={dateRange} setDate={setDateRange} />
              </div>
              <div className="w-full sm:w-1/3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-1/3">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar transações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <TransactionsList
                onTransactionUpdate={handleTransactionUpdate}
                filters={{
                  search: searchTerm,
                  category: selectedCategory === "all" ? "" : selectedCategory,
                  dateRange: {
                    from: dateRange.from!,
                    to: dateRange.to || dateRange.from!
                  }
                }}
                categories={CATEGORIES}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <TransactionsChart
                dateRange={dateRange}
                transactions={transactions}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Metas Financeiras</CardTitle>
            <Button variant="outline" size="sm" className="h-8">
              <PlusCircle className="w-4 h-4 mr-2" />
              Nova Meta
            </Button>
          </CardHeader>
          <CardContent>
            <FinancialGoals />
          </CardContent>
        </Card>
      </div>

      {/* Chat Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle>Chat Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <AIChat transactions={transactions} stats={stats} />
        </CardContent>
      </Card>

      <TransactionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleTransactionUpdate}
        categories={CATEGORIES}
      />
    </div>
  );
}
