"use server"

import { db } from "../db"
import { budgets, alerts } from "../db/schema"
import { createBudgetSchema } from "../validations/receipt"
import { eq, and, asc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getBudgets(userId: string) {
  return db
    .select()
    .from(budgets)
    .where(eq(budgets.userId, userId))
    .orderBy(asc(budgets.year), asc(budgets.month))
}

export async function getBudgetById(id: string) {
  return db.query.budgets.findFirst({
    where: eq(budgets.id, id),
    with: {
      alerts: true,
    },
  })
}

export async function getCurrentMonthBudget(userId: string, category?: string) {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const conditions = [
    eq(budgets.userId, userId),
    eq(budgets.month, month),
    eq(budgets.year, year),
  ]

  if (category) {
    conditions.push(eq(budgets.category, category as any))
  } else {
    conditions.push(eq(budgets.isGlobal, true))
  }

  return db.query.budgets.findFirst({
    where: and(...conditions),
  })
}

export async function createBudget(data: unknown) {
  try {
    const validated = createBudgetSchema.parse(data)

    const existingBudget = await db.query.budgets.findFirst({
      where: and(
        eq(budgets.userId, "temp-user"),
        validated.isGlobal
          ? eq(budgets.isGlobal, true)
          : eq(budgets.category, validated.category as any),
        eq(budgets.month, validated.month),
        eq(budgets.year, validated.year)
      ),
    })

    if (existingBudget) {
      return { error: "Budget already exists for this period" }
    }

    const [budget] = await db
      .insert(budgets)
      .values({
        userId: "temp-user",
        isGlobal: validated.isGlobal,
        category: validated.isGlobal ? null : validated.category,
        month: validated.month,
        year: validated.year,
        limitAmount: validated.limitAmount.toString(),
        currency: validated.currency,
      })
      .returning()

    revalidatePath("/budgets")
    return { success: true, budget }
  } catch (error) {
    console.error("Create budget error:", error)
    return { error: "Failed to create budget" }
  }
}

export async function deleteBudget(id: string) {
  try {
    await db.delete(budgets).where(eq(budgets.id, id))
    revalidatePath("/budgets")
    return { success: true }
  } catch (error) {
    console.error("Delete budget error:", error)
    return { error: "Failed to delete budget" }
  }
}

export async function checkBudgetAlerts(userId: string) {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const userBudgets = await db
    .select()
    .from(budgets)
    .where(
      and(
        eq(budgets.userId, userId),
        eq(budgets.month, month),
        eq(budgets.year, year)
      )
    )

  const newAlerts: typeof alerts.$inferInsert[] = []

  for (const budget of userBudgets) {
    // Calculate spent amount (placeholder - would need actual expense query)
    const spent = 0
    const limit = parseFloat(budget.limitAmount)
    const percentage = (spent / limit) * 100

    if (percentage >= 100) {
      newAlerts.push({
        userId,
        budgetId: budget.id,
        type: "budget_exceeded",
        title: "Budget Exceeded",
        message: `You've exceeded your ${budget.isGlobal ? "global" : budget.category} budget for this month.`,
        percentage: percentage.toString(),
        status: "unread",
      })
    } else if (percentage >= 90) {
      newAlerts.push({
        userId,
        budgetId: budget.id,
        type: "budget_warning_90",
        title: "Budget Warning",
        message: `You've used ${percentage.toFixed(0)}% of your ${budget.isGlobal ? "global" : budget.category} budget.`,
        percentage: percentage.toString(),
        status: "unread",
      })
    } else if (percentage >= 80) {
      newAlerts.push({
        userId,
        budgetId: budget.id,
        type: "budget_warning_80",
        title: "Budget Notice",
        message: `You've used ${percentage.toFixed(0)}% of your ${budget.isGlobal ? "global" : budget.category} budget.`,
        percentage: percentage.toString(),
        status: "unread",
      })
    }
  }

  if (newAlerts.length > 0) {
    await db.insert(alerts).values(newAlerts)
    revalidatePath("/")
  }
}

export async function getAlerts(userId: string) {
  return db
    .select()
    .from(alerts)
    .where(eq(alerts.userId, userId))
    .orderBy(alerts.createdAt)
}

export async function markAlertAsRead(alertId: string) {
  await db
    .update(alerts)
    .set({ status: "read", readAt: new Date() })
    .where(eq(alerts.id, alertId))
  
  revalidatePath("/")
}
