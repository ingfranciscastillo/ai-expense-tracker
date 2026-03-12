"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { BudgetForm } from "./_components/budget-form";

const categories = [
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

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export default function BudgetsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [showForm, setShowForm] = useState(false);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loadingBudgets, setLoadingBudgets] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchBudgets(session.user.id);
    }
  }, [session]);

  async function fetchBudgets(userId: string) {
    try {
      const res = await fetch(`/api/budgets?userId=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setBudgets(data);
      }
    } catch (error) {
      console.error("Failed to fetch budgets:", error);
    } finally {
      setLoadingBudgets(false);
    }
  }

  const getCategoryLabel = (category: string | null) => {
    if (!category) return "Global";
    return categories.find((c) => c.value === category)?.label || category;
  };

  const getMonthLabel = (month: number) => {
    return months.find((m) => m.value === month)?.label || "";
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    if (session?.user?.id) {
      fetchBudgets(session.user.id);
    }
  };

  return (
    <div className="max-w-6xl w-full mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <HugeiconsIcon
            icon={showForm ? ArrowRight01Icon : AddIcon}
            size={18}
          />
          {showForm ? "Cancel" : "Add Budget"}
        </Button>
      </div>

      {showForm && session?.user?.id && (
        <Card>
          <CardHeader>
            <CardTitle>Create Budget</CardTitle>
            <CardDescription>
              Set a spending limit for a specific category or globally.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetForm
              userId={session.user.id}
              onSuccess={handleFormSuccess}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        {loadingBudgets ? (
          <CardContent className="py-10 text-center text-muted-foreground">
            Loading...
          </CardContent>
        ) : budgets.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="rounded-full bg-muted p-4">
              <HugeiconsIcon
                icon={AddIcon}
                size={32}
                className="text-muted-foreground"
              />
            </div>
            <p className="text-muted-foreground text-center">
              No budgets yet. Create one to start tracking.
            </p>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Limit</TableHead>
                <TableHead className="text-right">Used</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell>
                    {getMonthLabel(budget.month)} {budget.year}
                  </TableCell>
                  <TableCell>
                    {budget.isGlobal ? "Global" : "Category"}
                  </TableCell>
                  <TableCell>{getCategoryLabel(budget.category)}</TableCell>
                  <TableCell className="text-right">
                    {budget.currency} {budget.limitAmount}
                  </TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: "0%" }}
                      ></div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
