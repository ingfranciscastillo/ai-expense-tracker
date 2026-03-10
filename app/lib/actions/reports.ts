"use server"

import { db } from "../db"
import { expenses } from "../db/schema"
import { eq, and, gte, lte } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function exportExpensesToCSV(
  userId: string,
  filters: {
    startDate: string
    endDate: string
    categories?: string[]
    includeDeductibleOnly?: boolean
  }
) {
  const conditions = [eq(expenses.userId, userId)]

  if (filters.startDate) {
    conditions.push(gte(expenses.expenseDate, new Date(filters.startDate)))
  }

  if (filters.endDate) {
    conditions.push(lte(expenses.expenseDate, new Date(filters.endDate)))
  }

  if (filters.includeDeductibleOnly) {
    conditions.push(eq(expenses.isDeductible, true))
  }

  const expenseList = await db
    .select()
    .from(expenses)
    .where(and(...conditions))
    .orderBy(expenses.expenseDate)

  const headers = [
    "Date",
    "Merchant",
    "Category",
    "Total Amount",
    "Tax Amount",
    "Currency",
    "Payment Method",
    "Deductible",
    "Notes",
  ]

  const rows = expenseList.map((expense) => [
    new Date(expense.expenseDate).toISOString().split("T")[0],
    expense.merchant,
    expense.category,
    expense.totalAmount,
    expense.taxAmount || "",
    expense.currency,
    expense.paymentMethod,
    expense.isDeductible ? "Yes" : "No",
    expense.description || "",
  ])

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

  return csv
}
