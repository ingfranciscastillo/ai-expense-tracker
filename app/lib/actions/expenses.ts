"use server"

import { db } from "../db"
import { expenses, receipts } from "../db/schema"
import { createExpenseManualSchema, updateExpenseSchema } from "../validations/receipt"
import { eq, and, gte, lte } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function getExpenses(userId: string, filters?: {
  startDate?: string
  endDate?: string
  category?: string
  minAmount?: number
  maxAmount?: number
}) {
  const conditions = [eq(expenses.userId, userId)]

  if (filters?.startDate) {
    conditions.push(gte(expenses.expenseDate, new Date(filters.startDate)))
  }

  if (filters?.endDate) {
    conditions.push(lte(expenses.expenseDate, new Date(filters.endDate)))
  }

  if (filters?.category) {
    conditions.push(eq(expenses.category, filters.category as any))
  }

  const result = await db
    .select()
    .from(expenses)
    .where(and(...conditions))
    .orderBy(expenses.expenseDate)

  return result
}

export async function getExpenseById(id: string) {
  return db.query.expenses.findFirst({
    where: eq(expenses.id, id),
    with: {
      receipt: true,
    },
  })
}

export async function createExpense(data: unknown, userId: string) {
  try {
    const validated = createExpenseManualSchema.parse(data)

    if (!userId) {
      return { error: "No has iniciado sesión. Por favor inicia sesión para crear un gasto." }
    }

    const [expense] = await db
      .insert(expenses)
      .values({
        userId: userId,
        merchant: validated.merchant,
        description: validated.description,
        expenseDate: new Date(validated.expenseDate),
        totalAmount: validated.totalAmount.toString(),
        taxAmount: validated.taxAmount?.toString(),
        currency: validated.currency,
        paymentMethod: validated.paymentMethod,
        category: validated.category,
        isDeductible: validated.isDeductible,
        deductibleNotes: validated.deductibleNotes,
      })
      .returning()

    revalidatePath("/dashboard/expenses")
    return { success: true, expense }
  } catch (error) {
    console.error("Create expense error:", error)
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => e.message).join(", ")
      return { error: `Datos inválidos: ${messages}` }
    }
    return { error: "No se pudo crear el gasto. Por favor intenta de nuevo." }
  }
}

export async function updateExpense(data: unknown) {
  try {
    const validated = updateExpenseSchema.parse(data)

    const existingExpense = await db.query.expenses.findFirst({
      where: eq(expenses.id, validated.id),
    })

    if (!existingExpense) {
      return { error: "El gasto que intentas editar no existe." }
    }

    const [expense] = await db
      .update(expenses)
      .set({
        ...(validated.merchant && { merchant: validated.merchant }),
        ...(validated.description && { description: validated.description }),
        ...(validated.expenseDate && { expenseDate: new Date(validated.expenseDate) }),
        ...(validated.totalAmount && { totalAmount: validated.totalAmount.toString() }),
        ...(validated.taxAmount && { taxAmount: validated.taxAmount.toString() }),
        ...(validated.currency && { currency: validated.currency }),
        ...(validated.paymentMethod && { paymentMethod: validated.paymentMethod }),
        ...(validated.category && { category: validated.category }),
        ...(validated.isDeductible !== undefined && { isDeductible: validated.isDeductible }),
        ...(validated.deductibleNotes && { deductibleNotes: validated.deductibleNotes }),
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, validated.id))
      .returning()

    revalidatePath("/dashboard/expenses")
    return { success: true, expense }
  } catch (error) {
    console.error("Update expense error:", error)
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => e.message).join(", ")
      return { error: `Datos inválidos: ${messages}` }
    }
    return { error: "No se pudo actualizar el gasto. Por favor intenta de nuevo." }
  }
}

export async function deleteExpense(id: string) {
  try {
    const existingExpense = await db.query.expenses.findFirst({
      where: eq(expenses.id, id),
    })

    if (!existingExpense) {
      return { error: "El gasto que intentas eliminar no existe." }
    }

    await db.delete(expenses).where(eq(expenses.id, id))
    revalidatePath("/dashboard/expenses")
    return { success: true }
  } catch (error) {
    console.error("Delete expense error:", error)
    return { error: "No se pudo eliminar el gasto. Por favor intenta de nuevo." }
  }
}
