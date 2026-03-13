"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { createBudget } from "../../../lib/actions/budgets";
import { createBudgetSchema } from "../../../lib/validations/receipt";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  FieldError,
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
  { value: "MXN", label: "MXN - Mexican Peso" },
  { value: "COP", label: "COP - Colombian Peso" },
  { value: "ARS", label: "ARS - Argentine Peso" },
];

type Currency = "USD" | "EUR" | "MXN" | "COP" | "ARS";

interface BudgetFormProps {
  userId: string;
  onSuccess?: () => void;
}

export function BudgetForm({ userId, onSuccess }: BudgetFormProps) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [isGlobalBudget, setIsGlobalBudget] = useState(true);

  const form = useForm({
    defaultValues: {
      isGlobal: true,
      category: undefined as string | undefined,
      month: currentMonth,
      year: currentYear,
      limitAmount: 0,
      currency: "USD" as Currency,
    },
    onSubmit: async ({ value }) => {
      const result = await createBudget(value, userId);

      if (result.error) {
        toast.error(result.error);
        throw new Error(result.error);
      }

      toast.success("Presupuesto creado exitosamente");
      onSuccess?.();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldSet>
        <FieldGroup>
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
                    Global budget (for all categories)
                  </Label>
                </div>
              </Field>
            )}
          />

          <form.Field
            name="category"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-disabled={isGlobalBudget}>
                  <FieldLabel className="mb-2">
                    Category (if not global)
                  </FieldLabel>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={field.handleChange}
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

          <div className="grid grid-cols-3 gap-4">
            <form.Field
              name="month"
              children={(field) => (
                <Field>
                  <FieldLabel>Month</FieldLabel>
                  <Select
                    name={field.name}
                    value={String(field.state.value)}
                    onValueChange={(value) =>
                      field.handleChange(parseInt(value))
                    }
                  >
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
                </Field>
              )}
            />

            <form.Field
              name="year"
              children={(field) => (
                <Field>
                  <FieldLabel>Year</FieldLabel>
                  <Select
                    name={field.name}
                    value={String(field.state.value)}
                    onValueChange={(value) =>
                      field.handleChange(parseInt(value))
                    }
                  >
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
                    onValueChange={(value) =>
                      field.handleChange(value as Currency)
                    }
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

          <form.Field
            name="limitAmount"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel>Limit Amount</FieldLabel>
                  <Input
                    id="limitAmount"
                    name={field.name}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(parseFloat(e.target.value) || 0)
                    }
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <Button
            type="submit"
            disabled={form.state.isSubmitting}
            className="w-full"
          >
            {form.state.isSubmitting ? "Creating..." : "Create Budget"}
          </Button>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
