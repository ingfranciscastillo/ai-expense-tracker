"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../lib/auth-client";
import { useBudgetsWithProgress, useDeleteBudget } from "../../lib/queries";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddIcon, ArrowRight01Icon, Edit01Icon, Delete01Icon, MoreHorizontalCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { BudgetForm } from "./_components/budget-form";
import { EditBudgetModal } from "./_components/edit-budget-modal";
import { toast } from "sonner";
import { ConfirmDialog } from "../_components/confirm-dialog";

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
  const userId = session?.user?.id;
  
  const { data: budgets = [], isLoading } = useBudgetsWithProgress(userId);
  const deleteMutation = useDeleteBudget(userId);
  
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<any | null>(null);

  const getCategoryLabel = (category: string | null) => {
    if (!category) return "Global";
    return categories.find((c) => c.value === category)?.label || category;
  };

  const getMonthLabel = (month: number) => {
    return months.find((m) => m.value === month)?.label || "";
  };

  const handleFormSuccess = () => {
    setShowForm(false);
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

      {showForm && userId && (
        <Card>
          <CardHeader>
            <CardTitle>Create Budget</CardTitle>
            <CardDescription>
              Set a spending limit for a specific category or globally.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetForm
              userId={userId}
              onSuccess={handleFormSuccess}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        {isLoading ? (
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
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget: any) => (
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
                  <TableCell className="text-right">
                    {budget.currency} {(budget.totalSpent || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (budget.percentage || 0) >= 90
                            ? "bg-destructive"
                            : (budget.percentage || 0) >= 80
                            ? "bg-yellow-500"
                            : "bg-primary"
                        }`}
                        style={{ width: `${budget.percentage || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {(budget.percentage || 0).toFixed(0)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <HugeiconsIcon icon={MoreHorizontalCircle01Icon} size={18} />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingBudget(budget)}>
                          <HugeiconsIcon icon={Edit01Icon} size={16} className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeletingBudget(budget)}>
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

      {editingBudget && (
        <EditBudgetModal
          budget={editingBudget}
          open={!!editingBudget}
          onOpenChange={(open) => {
            if (!open) {
              setEditingBudget(null);
            }
          }}
        />
      )}

      <ConfirmDialog
        open={!!deletingBudget}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingBudget(null);
          }
        }}
        onConfirm={async () => {
          if (!deletingBudget) return;
          try {
            await deleteMutation.mutateAsync(deletingBudget.id);
            toast.success("Presupuesto eliminado exitosamente");
          } catch (error: any) {
            toast.error(error.message || "Error al eliminar");
          }
          setDeletingBudget(null);
        }}
        title="Eliminar presupuesto"
        description="¿Estás seguro de que deseas eliminar este presupuesto? Esta acción no se puede deshacer."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
