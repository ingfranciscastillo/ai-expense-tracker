"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { updateBudget } from "../../../lib/actions/budgets";
import { updateBudgetSchema } from "../../../lib/validations/receipt";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldSet,
} from "@/components/ui/field";

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
  { value: "GBP", label: "GBP - British Pound" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "CNY", label: "CNY - Chinese Yuan" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "BRL", label: "BRL - Brazilian Real" },
  { value: "CLP", label: "CLP - Chilean Peso" },
  { value: "COP", label: "COP - Colombian Peso" },
  { value: "ARS", label: "ARS - Argentine Peso" },
  { value: "PEN", label: "PEN - Peruvian Sol" },
  { value: "UYU", label: "UYU - Uruguayan Peso" },
  { value: "MXN", label: "MXN - Mexican Peso" },
  { value: "OTHER", label: "OTHER - Other" },
];

type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CNY" | "CAD" | "AUD" | "BRL" | "CLP" | "COP" | "ARS" | "PEN" | "UYU" | "MXN" | "OTHER";
type Category = "comida" | "transporte" | "supermercado" | "salud" | "entretenimiento" | "software" | "educacion" | "hogar" | "servicios" | "trabajo" | "otros";

interface BudgetData {
  id: string;
  isGlobal: boolean;
  category: string | null;
  month: number;
  year: number;
  limitAmount: string | number;
  currency: string;
}

interface EditBudgetModalProps {
  budget: BudgetData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBudgetModal({ budget, open, onOpenChange }: EditBudgetModalProps) {
  const router = useRouter();
  const [isGlobalBudget, setIsGlobalBudget] = useState(budget.isGlobal);

  useEffect(() => {
    setIsGlobalBudget(budget.isGlobal);
  }, [budget.isGlobal, open]);

  const form = useForm({
    defaultValues: {
      id: budget.id,
      isGlobal: budget.isGlobal,
      category: (budget.category === null ? undefined : budget.category) as Category | undefined,
      month: budget.month,
      year: budget.year,
      limitAmount: typeof budget.limitAmount === "string" 
        ? parseFloat(budget.limitAmount) 
        : budget.limitAmount,
      currency: budget.currency as Currency,
    },
    onSubmit: async ({ value }) => {
      const result = await updateBudget(value);

      if (result.error) {
        toast.error(result.error);
        throw new Error(result.error);
      }

      toast.success("Presupuesto actualizado exitosamente");
      onOpenChange(false);
      router.refresh();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
          <DialogDescription>
            Update the budget details below.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldSet>
            <FieldGroup className="space-y-4">
              <form.Field
                name="isGlobal"
                children={(field) => (
                  <Field>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="isGlobal"
                        name={field.name}
                        checked={field.state.value}
                        onCheckedChange={(checked) => {
                          setIsGlobalBudget(checked === true);
                          field.handleChange(checked === true);
                        }}
                      />
                      <Label htmlFor="isGlobal" className="text-sm font-medium">
                        Global budget (applies to all categories)
                      </Label>
                    </div>
                  </Field>
                )}
              />

              <form.Field
                name="category"
                children={(field) => {
                  return (
                    <Field data-disabled={isGlobalBudget}>
                      <FieldLabel className="mb-2">
                        Category (if not global)
                      </FieldLabel>
                      <Select
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(value) => field.handleChange(value as Category)}
                      >
                        <SelectTrigger disabled={isGlobalBudget}>
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
                    </Field>
                  );
                }}
              />

              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="month"
                  children={(field) => (
                    <Field>
                      <FieldLabel>Month</FieldLabel>
                      <Select
                        name={field.name}
                        value={field.state.value.toString()}
                        onValueChange={(value) => field.handleChange(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((m) => (
                            <SelectItem key={m.value} value={m.value.toString()}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />

                <form.Field
                  name="year"
                  children={(field) => (
                    <Field>
                      <FieldLabel>Year</FieldLabel>
                      <Input
                        id="year"
                        type="number"
                        min="2020"
                        max="2100"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(parseInt(e.target.value))}
                      />
                    </Field>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="limitAmount"
                  children={(field) => (
                    <Field>
                      <FieldLabel>Limit Amount</FieldLabel>
                      <Input
                        id="limitAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                      />
                    </Field>
                  )}
                />

                <form.Field
                  name="currency"
                  children={(field) => (
                    <Field>
                      <FieldLabel>Currency</FieldLabel>
                      <Select
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(value) => field.handleChange(value as Currency)}
                      >
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
                    </Field>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.state.isSubmitting}
                >
                  {form.state.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </FieldGroup>
          </FieldSet>
        </form>
      </DialogContent>
    </Dialog>
  );
}
