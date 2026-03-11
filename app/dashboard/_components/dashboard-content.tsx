"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "../../lib/auth-client"
import { ExpensesCharts } from "./expenses-charts"

interface DashboardContentProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
}

export function DashboardContent({ user }: DashboardContentProps) {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    totalExpenses: 0,
    thisMonth: 0,
    receiptsCount: 0,
    budgetUsed: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData(session.user.id)
    } else {
      setLoading(false)
    }
  }, [session])

  async function fetchDashboardData(userId: string) {
    try {
      const [expensesRes, receiptsRes] = await Promise.all([
        fetch(`/api/expenses?userId=${userId}`),
        fetch(`/api/receipts?userId=${userId}`),
      ])

      const expenses = (await expensesRes.json()) || []
      const receipts = (await receiptsRes.json()) || []

      if (!Array.isArray(expenses) || !Array.isArray(receipts)) {
        setLoading(false)
        return
      }

      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      const thisMonthExpenses = expenses.filter((e: any) => {
        const expenseDate = new Date(e.expenseDate)
        return (
          expenseDate.getMonth() === currentMonth &&
          expenseDate.getFullYear() === currentYear
        )
      })

      const totalExpenses = expenses.reduce(
        (sum: number, e: any) => sum + (Number(e.totalAmount) || 0),
        0
      )
      const thisMonthTotal = thisMonthExpenses.reduce(
        (sum: number, e: any) => sum + (Number(e.totalAmount) || 0),
        0
      )

      setStats({
        totalExpenses,
        thisMonth: thisMonthTotal,
        receiptsCount: receipts.length || 0,
        budgetUsed: 0,
      })
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Welcome back!</h2>
        <p className="text-muted-foreground mt-2">{user?.name ?? "User"}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Total Expenses</h3>
          <p className="text-2xl font-bold mt-2">
            {loading ? "..." : `$${stats.totalExpenses.toFixed(2)}`}
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">This Month</h3>
          <p className="text-2xl font-bold mt-2">
            {loading ? "..." : `$${stats.thisMonth.toFixed(2)}`}
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Receipts</h3>
          <p className="text-2xl font-bold mt-2">
            {loading ? "..." : stats.receiptsCount}
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Budget Used</h3>
          <p className="text-2xl font-bold mt-2">
            {loading ? "..." : `${stats.budgetUsed}%`}
          </p>
        </div>
      </div>

      <ExpensesCharts />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <div className="mt-4 space-y-2">
            <Link
              href="/dashboard/receipts/upload"
              className="block w-full py-2 px-4 text-center border rounded-md hover:bg-accent"
            >
              Upload Receipt
            </Link>
            <Link
              href="/dashboard/expenses"
              className="block w-full py-2 px-4 text-center border rounded-md hover:bg-accent"
            >
              View Expenses
            </Link>
            <Link
              href="/dashboard/budgets"
              className="block w-full py-2 px-4 text-center border rounded-md hover:bg-accent"
            >
              Manage Budgets
            </Link>
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <p className="text-muted-foreground mt-4 text-sm">
            {stats.receiptsCount > 0
              ? `You have ${stats.receiptsCount} receipt${stats.receiptsCount > 1 ? "s" : ""} and ${stats.totalExpenses > 0 ? `${stats.totalExpenses} expense${stats.totalExpenses > 1 ? "s" : ""}` : "no expenses"} recorded.`
              : "No recent activity yet. Upload your first receipt to get started."}
          </p>
        </div>
      </div>
    </div>
  )
}
