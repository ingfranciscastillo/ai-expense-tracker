"use client"

import { useState } from "react"
import { createBudget } from "../../lib/actions/budgets"
import { useRouter } from "next/navigation"

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
]

export default function BudgetsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const data = {
      isGlobal: formData.get("isGlobal") === "on",
      category: formData.get("category") || undefined,
      month: parseInt(formData.get("month") as string),
      year: parseInt(formData.get("year") as string),
      limitAmount: parseFloat(formData.get("limitAmount") as string),
      currency: formData.get("currency"),
    }

    const result = await createBudget(data)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      setShowForm(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Budgets</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          {showForm ? "Cancel" : "Add Budget"}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Create Budget</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                id="isGlobal"
                name="isGlobal"
                type="checkbox"
                className="w-4 h-4"
                defaultChecked
              />
              <label htmlFor="isGlobal" className="text-sm font-medium">
                Global budget (for all categories)
              </label>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                Category (if not global)
              </label>
              <select
                id="category"
                name="category"
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="month" className="block text-sm font-medium mb-1">
                  Month
                </label>
                <select
                  id="month"
                  name="month"
                  defaultValue={currentMonth}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium mb-1">
                  Year
                </label>
                <select
                  id="year"
                  name="year"
                  defaultValue={currentYear}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value={currentYear}>{currentYear}</option>
                  <option value={currentYear + 1}>{currentYear + 1}</option>
                </select>
              </div>

              <div>
                <label htmlFor="limitAmount" className="block text-sm font-medium mb-1">
                  Limit Amount
                </label>
                <input
                  id="limitAmount"
                  name="limitAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Budget"}
            </button>
          </form>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Period</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Limit</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Used</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Progress</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                No budgets yet. Create one to start tracking.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
