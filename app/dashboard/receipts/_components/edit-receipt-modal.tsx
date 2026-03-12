"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { updateReceipt } from "../../../lib/actions/receipts";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface ReceiptData {
  id: string;
  merchant: string | null;
  expenseDate: Date | string | null;
  totalAmount: string | number | null;
  taxAmount: string | number | null;
  currency: string | null;
  paymentMethod: string | null;
  categorySuggestion: string | null;
  fileType: string;
  cloudinaryUrl: string;
}

interface EditReceiptModalProps {
  receipt: ReceiptData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditReceiptModal({ receipt, open, onOpenChange }: EditReceiptModalProps) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      id: receipt.id,
      merchant: receipt.merchant || "",
      expenseDate: receipt.expenseDate
        ? (typeof receipt.expenseDate === "string"
            ? receipt.expenseDate.split("T")[0]
            : new Date(receipt.expenseDate).toISOString().split("T")[0])
        : "",
      totalAmount: receipt.totalAmount
        ? (typeof receipt.totalAmount === "string"
            ? parseFloat(receipt.totalAmount)
            : receipt.totalAmount)
        : 0,
      taxAmount: receipt.taxAmount
        ? (typeof receipt.taxAmount === "string"
            ? parseFloat(receipt.taxAmount)
            : receipt.taxAmount)
        : undefined,
      currency: (receipt.currency as Currency) || "USD",
      paymentMethod: (receipt.paymentMethod as PaymentMethod) || "desconocido",
      category: (receipt.categorySuggestion as Category) || "otros" as Category,
      reviewedAt: true,
    },
    onSubmit: async ({ value }) => {
      const result = await updateReceipt(value);

      if (result.error) {
        toast.error(result.error);
        throw new Error(result.error);
      }

      toast.success("Recibo actualizado exitosamente");
      onOpenChange(false);
      router.refresh();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Receipt</DialogTitle>
          <DialogDescription>
            Update the receipt details below.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          {receipt.fileType === "pdf" ? (
            <iframe
              src={receipt.cloudinaryUrl}
              className="w-full h-40 rounded"
              title="Receipt PDF"
            />
          ) : (
            <img
              src={receipt.cloudinaryUrl}
              alt="Receipt"
              className="w-full h-40 object-contain rounded"
            />
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldSet>
            <FieldGroup className="space-y-4">
              <form.Field
                name="merchant"
                children={(field) => (
                  <Field>
                    <FieldLabel>Merchant</FieldLabel>
                    <Input
                      id="merchant"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </Field>
                )}
              />

              <form.Field
                name="expenseDate"
                children={(field) => (
                  <Field>
                    <FieldLabel>Date</FieldLabel>
                    <Input
                      id="expenseDate"
                      name={field.name}
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </Field>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="totalAmount"
                  children={(field) => (
                    <Field>
                      <FieldLabel>Total Amount</FieldLabel>
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
                  )}
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
                children={(field) => (
                  <Field>
                    <FieldLabel>Category</FieldLabel>
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
