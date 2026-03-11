"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "../../lib/auth-client"

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
  const { data: session, isPending } = useSession()
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchExpenses(session.user.id)
    }
  }, [session])

  async function fetchExpenses(userId: string) {
    try {
      const res = await fetch(`/api/expenses?userId=${userId}`)
      const data = await res.json()
      setExpenses(data)
    } catch (error) {
      console.error("Failed to fetch expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category
  }

  if (isPending || loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (!session) {
    return <div className="p-8 text-center">Please log in to view expenses.</div>
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <Link
          href="/dashboard/expenses/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Add Expense
        </Link>
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
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No expenses yet.{" "}
                  <Link href="/dashboard/expenses/new" className="text-primary hover:underline">
                    Add your first expense
                  </Link>
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="border-t">
                  <td className="px-4 py-3 text-sm">
                    {expense.expenseDate 
                      ? new Date(expense.expenseDate).toLocaleDateString() 
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">{expense.merchant}</td>
                  <td className="px-4 py-3 text-sm">{getCategoryLabel(expense.category)}</td>
                  <td className="px-4 py-3 text-sm">
                    {expense.currency} {expense.totalAmount}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {expense.isDeductible ? "Yes" : "No"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
