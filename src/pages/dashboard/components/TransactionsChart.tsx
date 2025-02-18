import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface TransactionsChartProps {
  dateRange: DateRange;
  transactions?: any[];
}

export default function TransactionsChart({ dateRange, transactions: propTransactions }: TransactionsChartProps) {
  const [data, setData] = useState<any[]>([]);
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"];

  useEffect(() => {
    if (propTransactions) {
      const expensesByCategory = propTransactions
        .filter(t => t.type === "expense")
        .reduce((acc: { [key: string]: number }, transaction: any) => {
          const category = transaction.category;
          acc[category] = (acc[category] || 0) + Number(transaction.amount);
          return acc;
        }, {});

      const chartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
        name: category,
        value: amount
      }));

      setData(chartData);
    } else {
      fetchTransactions();
    }
  }, [propTransactions, dateRange]);

  const fetchTransactions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("type", "expense")
        .gte("date", dateRange.from!.toISOString())
        .lte("date", (dateRange.to || dateRange.from)!.toISOString());

      if (error) throw error;

      const expensesByCategory = (transactions || []).reduce((acc: { [key: string]: number }, transaction: any) => {
        const category = transaction.category;
        acc[category] = (acc[category] || 0) + Number(transaction.amount);
        return acc;
      }, {});

      const chartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
        name: category,
        value: amount
      }));

      setData(chartData);
    } catch (error) {
      console.error("Error fetching transactions for chart:", error);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-2">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name} (${formatCurrency(value)})`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
