"use client"

import Link from "next/link"

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
]

export default function ExpensesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <div className="flex gap-4">
          <Link
            href="/expenses/new"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Add Expense
          </Link>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search merchants..."
          className="px-3 py-2 border rounded-md flex-1"
        />
        <select className="px-3 py-2 border rounded-md">
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="px-3 py-2 border rounded-md"
        />
        <input
          type="date"
          className="px-3 py-2 border rounded-md"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Merchant</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Deductible</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                No expenses yet.{" "}
                <Link href="/expenses/new" className="text-primary hover:underline">
                  Add your first expense
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
