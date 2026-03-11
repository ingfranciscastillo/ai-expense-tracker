"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "@/app/lib/auth-client"

const categories = [
  { value: "comida", label: "Comida", color: "var(--chart-1)" },
  { value: "transporte", label: "Transporte", color: "var(--chart-2)" },
  { value: "supermercado", label: "Supermercado", color: "var(--chart-3)" },
  { value: "salud", label: "Salud", color: "var(--chart-4)" },
  { value: "entretenimiento", label: "Entretenimiento", color: "var(--chart-5)" },
  { value: "software", label: "Software", color: "var(--chart-1)" },
  { value: "educacion", label: "Educación", color: "var(--chart-2)" },
  { value: "hogar", label: "Hogar", color: "var(--chart-3)" },
  { value: "servicios", label: "Servicios", color: "var(--chart-4)" },
  { value: "trabajo", label: "Trabajo", color: "var(--chart-5)" },
  { value: "otros", label: "Otros", color: "var(--chart-1)" },
]

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

interface ExpenseData {
  category: string
  amount: number
}

interface MonthlyData {
  month: string
  amount: number
}

export function ExpensesCharts() {
  const { data: session } = useSession()
  const [categoryData, setCategoryData] = useState<ExpenseData[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchExpenseData(session.user.id)
    }
  }, [session])

  async function fetchExpenseData(userId: string) {
    try {
      const res = await fetch(`/api/expenses?userId=${userId}`)
      const expenses = await res.json()

      if (!Array.isArray(expenses)) {
        setLoading(false)
        return
      }

      const categoryMap = new Map<string, number>()
      const monthlyMap = new Map<string, number>()

      expenses.forEach((expense: any) => {
        const amount = Number(expense.totalAmount) || 0
        const category = expense.category || "otros"
        
        categoryMap.set(category, (categoryMap.get(category) || 0) + amount)

        if (expense.expenseDate) {
          const date = new Date(expense.expenseDate)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
          monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + amount)
        }
      })

      const categoryResult = categories.map(cat => ({
        category: cat.label,
        amount: categoryMap.get(cat.value) || 0,
      })).filter(d => d.amount > 0)

      const sortedMonths = Array.from(monthlyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)

      const monthlyResult = sortedMonths.map(([month, amount]) => ({
        month: months[parseInt(month.split("-")[1]) - 1],
        amount,
      }))

      setCategoryData(categoryResult)
      setMonthlyData(monthlyResult)
    } catch (error) {
      console.error("Failed to fetch expense data for charts:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (categoryData.length === 0 && monthlyData.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Your spending distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No expense data yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>Your spending over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No expense data yet</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
          <CardDescription>Your spending distribution</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis 
                dataKey="category" 
                type="category" 
                width={80}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "var(--card)", 
                  border: "1px solid var(--border)",
                  borderRadius: "8px"
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
              />
              <Bar 
                dataKey="amount" 
                fill="var(--chart-1)" 
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
          <CardDescription>Your spending over time</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                stroke="var(--muted-foreground)"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="var(--muted-foreground)"
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "var(--card)", 
                  border: "1px solid var(--border)",
                  borderRadius: "8px"
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="var(--chart-2)" 
                fill="var(--chart-2)"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
