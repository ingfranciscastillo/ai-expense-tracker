"use client";

import { useState, useEffect } from "react";
import { createBudget } from "../../lib/actions/budgets";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "MXN", label: "MXN - Mexican Peso" },
  { value: "COP", label: "COP - Colombian Peso" },
  { value: "ARS", label: "ARS - Argentine Peso" },
];

export default function BudgetsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loadingBudgets, setLoadingBudgets] = useState(true);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!session?.user?.id) {
      setError("Not authenticated");
      setIsLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);

    const data = {
      isGlobal: formData.get("isGlobal") === "on",
      category: formData.get("category") || undefined,
      month: parseInt(formData.get("month") as string),
      year: parseInt(formData.get("year") as string),
      limitAmount: parseFloat(formData.get("limitAmount") as string),
      currency: formData.get("currency"),
    };

    const result = await createBudget(data, session.user.id);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setShowForm(false);
      fetchBudgets(session.user.id);
    }
  };

  const getCategoryLabel = (category: string | null) => {
    if (!category) return "Global";
    return categories.find((c) => c.value === category)?.label || category;
  };

  const getMonthLabel = (month: number) => {
    return months.find((m) => m.value === month)?.label || "";
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

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Budget</CardTitle>
            <CardDescription>
              Set a spending limit for a specific category or globally.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Checkbox id="isGlobal" name="isGlobal" defaultChecked />
                <Label htmlFor="isGlobal" className="text-sm font-medium">
                  Global budget (for all categories)
                </Label>
              </div>

              <div>
                <Label htmlFor="category">Category (if not global)</Label>
                <Select name="category">
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="month">Month</Label>
                  <Select name="month" defaultValue={String(currentMonth)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={String(m.value)}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select name="year" defaultValue={String(currentYear)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={String(currentYear)}>
                        {currentYear}
                      </SelectItem>
                      <SelectItem value={String(currentYear + 1)}>
                        {currentYear + 1}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select name="currency" defaultValue="USD">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="limitAmount">Limit Amount</Label>
                <Input
                  id="limitAmount"
                  name="limitAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Creating..." : "Create Budget"}
              </Button>
            </form>
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
