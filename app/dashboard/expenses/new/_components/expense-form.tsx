"use client";

import { useForm } from "@tanstack/react-form";
import { createExpense } from "../../../../lib/actions/expenses";
import { createExpenseManualSchema } from "../../../../lib/validations/receipt";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
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

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "MXN", label: "MXN - Mexican Peso" },
  { value: "COP", label: "COP - Colombian Peso" },
  { value: "ARS", label: "ARS - Argentine Peso" },
];

const paymentMethods = [
  { value: "efectivo", label: "Efectivo" },
  { value: "tarjeta_debito", label: "Tarjeta Débito" },
  { value: "tarjeta_credito", label: "Tarjeta Crédito" },
  { value: "transferencia", label: "Transferencia" },
  { value: "otro", label: "Otro" },
  { value: "desconocido", label: "Desconocido" },
];

type Currency = "USD" | "EUR" | "MXN" | "COP" | "ARS" | "OTHER";
type Category =
  | "comida"
  | "transporte"
  | "supermercado"
  | "salud"
  | "entretenimiento"
  | "software"
  | "educacion"
  | "hogar"
  | "servicios"
  | "trabajo"
  | "otros";
type PaymentMethod =
  | "efectivo"
  | "tarjeta_debito"
  | "tarjeta_credito"
  | "transferencia"
  | "otro"
  | "desconocido";

interface ExpenseFormProps {
  userId: string;
  onSuccess?: () => void;
}

export function ExpenseForm({ userId, onSuccess }: ExpenseFormProps) {
  const form = useForm({
    defaultValues: {
      merchant: "",
      description: "",
      expenseDate: "",
      totalAmount: 0,
      taxAmount: undefined as number | undefined,
      currency: "USD" as Currency,
      paymentMethod: "desconocido" as PaymentMethod,
      category: "comida" as Category,
      isDeductible: false,
      deductibleNotes: "",
    },
    onSubmit: async ({ value }) => {
      const result = await createExpense(value, userId);

      if (result.error) {
        toast.error(result.error);
        throw new Error(result.error);
      }

      toast.success("Gasto creado exitosamente");
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
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="merchant"
              validators={{
                onChange: createExpenseManualSchema.shape.merchant,
              }}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Merchant *</FieldLabel>
                    <Input
                      id="merchant"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="expenseDate"
              validators={{
                onChange: createExpenseManualSchema.shape.expenseDate,
              }}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                const selectedDate = field.state.value
                  ? parse(field.state.value, "yyyy-MM-dd", new Date())
                  : undefined;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Date *</FieldLabel>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {selectedDate
                            ? format(selectedDate, "PPP", { locale: es })
                            : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            if (date) {
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, "0");
                              const day = String(date.getDate()).padStart(2, "0");
                              field.handleChange(`${year}-${month}-${day}`);
                            } else {
                              field.handleChange("");
                            }
                          }}
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>

                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="totalAmount"
              validators={{
                onChange: createExpenseManualSchema.shape.totalAmount,
              }}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Total Amount *</FieldLabel>
                    <Input
                      id="totalAmount"
                      name={field.name}
                      type="number"
                      step="0.01"
                      min="0"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(parseFloat(e.target.value) || 0)
                      }
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="taxAmount"
              children={(field) => (
                <Field>
                  <FieldLabel>Tax Amount</FieldLabel>
                  <Input
                    id="taxAmount"
                    name={field.name}
                    type="number"
                    step="0.01"
                    min="0"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value ? parseFloat(e.target.value) : undefined,
                      )
                    }
                  />
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <form.Field
              name="paymentMethod"
              children={(field) => (
                <Field>
                  <FieldLabel>Payment Method</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as PaymentMethod)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>

          <form.Field
            name="category"
            validators={{
              onChange: createExpenseManualSchema.shape.category,
            }}
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel>Category *</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as Category)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="description"
            children={(field) => (
              <Field>
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  id="description"
                  name={field.name}
                  rows={2}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          />

          <form.Field
            name="isDeductible"
            children={(field) => (
              <Field>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isDeductible"
                    name={field.name}
                    checked={field.state.value}
                    onCheckedChange={(checked) =>
                      field.handleChange(checked === true)
                    }
                  />
                  <Label htmlFor="isDeductible" className="text-sm font-medium">
                    Tax Deductible
                  </Label>
                </div>
              </Field>
            )}
          />

          <form.Field
            name="deductibleNotes"
            children={(field) => (
              <Field>
                <FieldLabel>Deductible Notes</FieldLabel>
                <Textarea
                  id="deductibleNotes"
                  name={field.name}
                  rows={2}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          />

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={form.state.isSubmitting}
              className="flex-1"
            >
              {form.state.isSubmitting ? "Saving..." : "Save Expense"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
