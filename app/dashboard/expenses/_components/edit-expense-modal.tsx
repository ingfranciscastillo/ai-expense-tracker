"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { updateExpense } from "../../../lib/actions/expenses";
import { updateExpenseSchema } from "../../../lib/validations/receipt";
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

const paymentMethods = [
  { value: "efectivo", label: "Efectivo" },
  { value: "tarjeta_debito", label: "Tarjeta Débito" },
  { value: "tarjeta_credito", label: "Tarjeta Crédito" },
  { value: "transferencia", label: "Transferencia" },
  { value: "otro", label: "Otro" },
  { value: "desconocido", label: "Desconocido" },
];

type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CNY" | "CAD" | "AUD" | "BRL" | "CLP" | "COP" | "ARS" | "PEN" | "UYU" | "MXN" | "OTHER";
type Category = "comida" | "transporte" | "supermercado" | "salud" | "entretenimiento" | "software" | "educacion" | "hogar" | "servicios" | "trabajo" | "otros";
type PaymentMethod = "efectivo" | "tarjeta_debito" | "tarjeta_credito" | "transferencia" | "otro" | "desconocido";

interface ExpenseData {
  id: string;
  merchant: string;
  description: string | null;
  expenseDate: Date | string;
  totalAmount: string | number;
  taxAmount: string | number | null;
  currency: string;
  paymentMethod: string;
  category: string;
  isDeductible: boolean;
  deductibleNotes: string | null;
}

interface EditExpenseModalProps {
  expense: ExpenseData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditExpenseModal({ expense, open, onOpenChange }: EditExpenseModalProps) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      id: expense.id,
      merchant: expense.merchant,
      description: expense.description || "",
      expenseDate: typeof expense.expenseDate === "string" 
        ? expense.expenseDate.split("T")[0] 
        : new Date(expense.expenseDate).toISOString().split("T")[0],
      totalAmount: typeof expense.totalAmount === "string" 
        ? parseFloat(expense.totalAmount) 
        : expense.totalAmount,
      taxAmount: expense.taxAmount 
        ? (typeof expense.taxAmount === "string" ? parseFloat(expense.taxAmount) : expense.taxAmount)
        : undefined,
      currency: expense.currency as Currency,
      paymentMethod: expense.paymentMethod as PaymentMethod,
      category: expense.category as Category,
      isDeductible: expense.isDeductible,
      deductibleNotes: expense.deductibleNotes || "",
    },
    onSubmit: async ({ value }) => {
      const result = await updateExpense(value);

      if (result.error) {
        toast.error(result.error);
        throw new Error(result.error);
      }

      toast.success("Gasto actualizado exitosamente");
      onOpenChange(false);
      router.refresh();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>
            Update the expense details below.
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
              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="merchant"
                  children={(field) => {
                    return (
                      <Field>
                        <FieldLabel>Merchant *</FieldLabel>
                        <Input
                          id="merchant"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </Field>
                    );
                  }}
                />

                <form.Field
                  name="expenseDate"
                  children={(field) => {
                    const selectedDate = field.state.value
                      ? parse(field.state.value, "yyyy-MM-dd", new Date())
                      : undefined;

                    return (
                      <Field>
                        <FieldLabel>Date *</FieldLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
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
                      </Field>
                    );
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="totalAmount"
                  children={(field) => {
                    return (
                      <Field>
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
                            e.target.value ? parseFloat(e.target.value) : undefined
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
                children={(field) => {
                  return (
                    <Field>
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
