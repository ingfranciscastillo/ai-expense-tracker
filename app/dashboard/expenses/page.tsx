"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "../../lib/auth-client";
import { useExpenses, useDeleteExpense } from "../../lib/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight01Icon, Edit01Icon, MoreHorizontalCircle01Icon, Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { EditExpenseModal } from "./_components/edit-expense-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ConfirmDialog } from "../_components/confirm-dialog";

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
  const { data: session, isPending: sessionPending } = useSession();
  const userId = session?.user?.id;
  
  const { data: expenses = [], isLoading } = useExpenses(userId);
  const deleteMutation = useDeleteExpense(userId);
  
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<any | null>(null);

  const getCategoryLabel = (category: string) => {
    return categories.find((c) => c.value === category)?.label || category;
  };

  if (sessionPending || isLoading) {
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
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense: any) => (
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
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <HugeiconsIcon icon={MoreHorizontalCircle01Icon} size={18} />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingExpense(expense)}>
                          <HugeiconsIcon icon={Edit01Icon} size={16} className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeletingExpense(expense)}>
                          <HugeiconsIcon icon={Delete01Icon} size={16} className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          open={!!editingExpense}
          onOpenChange={(open) => {
            if (!open) {
              setEditingExpense(null);
            }
          }}
        />
      )}

      <ConfirmDialog
        open={!!deletingExpense}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingExpense(null);
          }
        }}
        onConfirm={async () => {
          if (!deletingExpense) return;
          try {
            await deleteMutation.mutateAsync(deletingExpense.id);
            toast.success("Gasto eliminado exitosamente");
          } catch (error: any) {
            toast.error(error.message || "Error al eliminar");
          }
          setDeletingExpense(null);
        }}
        title="Eliminar gasto"
        description="¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
