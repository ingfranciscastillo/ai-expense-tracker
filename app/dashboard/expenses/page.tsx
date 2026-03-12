"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "../../lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight01Icon, WalletIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const categories = [
  { value: "", label: "All Categories" },
  { value: "comida", label: "Comida" },
  { value: "transporte", label: "Transporte" },
  { value: "supermercado", label: "Supermercado" },
  { value: "salud", label: "Salud" },
  { value: "entretenimiento", label: "Entretenimiento" },
  { value: "software", label: "Software" },
  { value: "educacion", label: "Educación" },
  { value: "hogar", label: "Hogar" },
  { value: "servicios", label: "Servicios" },
  { value: "trabajo", label: "Trabajo" },
  { value: "otros", label: "Otros" },
];

export default function ExpensesPage() {
  const { data: session, isPending } = useSession();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchExpenses(session.user.id);
    }
  }, [session]);

  async function fetchExpenses(userId: string) {
    try {
      const res = await fetch(`/api/expenses?userId=${userId}`);
      const data = await res.json();
      setExpenses(data);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setLoading(false);
    }
  }

  const getCategoryLabel = (category: string) => {
    return categories.find((c) => c.value === category)?.label || category;
  };

  if (isPending || loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Loading...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Please log in to view expenses.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
        <Button asChild>
          <Link href="/dashboard/expenses/new" className="gap-2">
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
            Add Expense
          </Link>
        </Button>
      </div>

      <Card>
        {expenses.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="rounded-full bg-muted p-4">
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={32}
                className="text-muted-foreground"
              />
            </div>
            <p className="text-muted-foreground text-center">
              No expenses yet.
            </p>
            <Button variant="outline" asChild>
              <Link href="/dashboard/expenses/new">Add your first expense</Link>
            </Button>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Deductible</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {expense.expenseDate
                      ? new Date(expense.expenseDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {expense.merchant}
                  </TableCell>
                  <TableCell>{getCategoryLabel(expense.category)}</TableCell>
                  <TableCell className="text-right">
                    {expense.currency} {expense.totalAmount}
                  </TableCell>
                  <TableCell>{expense.isDeductible ? "Yes" : "No"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
