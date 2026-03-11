"use client"

import { useState } from "react"
import { createExpense } from "../../../lib/actions/expenses"
import { useRouter } from "next/navigation"
import { useSession } from "../../../lib/auth-client"

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
]

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "MXN", label: "MXN - Mexican Peso" },
  { value: "COP", label: "COP - Colombian Peso" },
  { value: "ARS", label: "ARS - Argentine Peso" },
]

const paymentMethods = [
  { value: "efectivo", label: "Efectivo" },
  { value: "tarjeta_debito", label: "Tarjeta Débito" },
  { value: "tarjeta_credito", label: "Tarjeta Crédito" },
  { value: "transferencia", label: "Transferencia" },
  { value: "otro", label: "Otro" },
  { value: "desconocido", label: "Desconocido" },
]

export default function NewExpensePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!session?.user?.id) {
      setError("Not authenticated")
      setIsLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    
    const data = {
      merchant: formData.get("merchant"),
      description: formData.get("description") || undefined,
      expenseDate: formData.get("expenseDate"),
      totalAmount: parseFloat(formData.get("totalAmount") as string),
      taxAmount: formData.get("taxAmount") ? parseFloat(formData.get("taxAmount") as string) : undefined,
      currency: formData.get("currency"),
      paymentMethod: formData.get("paymentMethod"),
      category: formData.get("category"),
      isDeductible: formData.get("isDeductible") === "on",
      deductibleNotes: formData.get("deductibleNotes") || undefined,
    }

    const result = await createExpense(data, session.user.id)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      router.push("/dashboard/expenses")
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Add Expense</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="merchant" className="block text-sm font-medium mb-1">
              Merchant *
            </label>
            <input
              id="merchant"
              name="merchant"
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label htmlFor="expenseDate" className="block text-sm font-medium mb-1">
              Date *
            </label>
            <input
              id="expenseDate"
              name="expenseDate"
              type="date"
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="totalAmount" className="block text-sm font-medium mb-1">
              Total Amount *
            </label>
            <input
              id="totalAmount"
              name="totalAmount"
              type="number"
              step="0.01"
              min="0"
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label htmlFor="taxAmount" className="block text-sm font-medium mb-1">
              Tax Amount
            </label>
            <input
              id="taxAmount"
              name="taxAmount"
              type="number"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="currency" className="block text-sm font-medium mb-1">
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              className="w-full px-3 py-2 border rounded-md"
            >
              {currencies.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium mb-1">
              Payment Method
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              className="w-full px-3 py-2 border rounded-md"
            >
              {paymentMethods.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category *
          </label>
          <select
            id="category"
            name="category"
            required
            className="w-full px-3 py-2 border rounded-md"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isDeductible"
            name="isDeductible"
            type="checkbox"
            className="w-4 h-4"
          />
          <label htmlFor="isDeductible" className="text-sm font-medium">
            Tax Deductible
          </label>
        </div>

        <div>
          <label htmlFor="deductibleNotes" className="block text-sm font-medium mb-1">
            Deductible Notes
          </label>
          <textarea
            id="deductibleNotes"
            name="deductibleNotes"
            rows={2}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Expense"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-2 px-4 border rounded-md hover:bg-accent"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
