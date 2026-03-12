"use server"

import { db } from "../db"
import { receipts, expenses } from "../db/schema"
import { uploadToCloudinary } from "../storage/cloudinary"
import { extractDataFromReceipt } from "../ai/extraction"
import type { ExtractionResult } from "../ai/prompts"
import { createExpenseFromReceiptSchema, updateReceiptSchema } from "../validations/receipt"
import { eq, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function getReceipts(userId: string) {
  return db
    .select()
    .from(receipts)
    .where(eq(receipts.userId, userId))
    .orderBy(desc(receipts.createdAt))
}

export async function getReceiptById(id: string) {
  return db.query.receipts.findFirst({
    where: eq(receipts.id, id),
  })
}

export async function uploadReceipt(formData: FormData, userId: string) {
  try {
    const file = formData.get("file") as File | null

    if (!file) {
      return { error: "No file provided" }
    }

    if (!userId) {
      return { error: "Not authenticated" }
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      return { error: "Tipo de archivo no permitido" }
    }

    if (file.size > maxSize) {
      return { error: "El archivo no puede exceder 10MB" }
    }

    const cloudinaryResult = await uploadToCloudinary(file)

    const [receipt] = await db
      .insert(receipts)
      .values({
        userId: userId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        cloudinaryUrl: cloudinaryResult.secure_url,
        originalFilename: file.name,
        fileType: file.type.startsWith("image") ? "image" : "pdf",
        status: "pending",
      })
      .returning()

    await processReceiptWithAI(receipt.id)

    const updatedReceipt = await db.query.receipts.findFirst({
      where: eq(receipts.id, receipt.id),
    })

    if (updatedReceipt?.status === "failed") {
      return { 
        error: "AI processing failed. Please try again.", 
        receipt: receipt,
        details: updatedReceipt.aiRawResponse 
      }
    }

    return { success: true, receipt: updatedReceipt ?? receipt }
  } catch (error) {
    console.error("Upload error:", error)
    return { error: "Failed to upload receipt" }
  }
}

export async function processReceiptWithAI(receiptId: string) {
  try {
    await db
      .update(receipts)
      .set({ status: "processing" })
      .where(eq(receipts.id, receiptId))

    const receipt = await db.query.receipts.findFirst({
      where: eq(receipts.id, receiptId),
    })

    if (!receipt) {
      throw new Error("Receipt not found")
    }

    const aiResult: ExtractionResult = await extractDataFromReceipt(receipt.cloudinaryUrl)

    const paymentMethodValue = aiResult.paymentMethod as 
      | "efectivo" 
      | "tarjeta_debito" 
      | "tarjeta_credito" 
      | "transferencia" 
      | "otro" 
      | "desconocido" 
      | null

    const categoryValue = aiResult.categorySuggestion as 
      | "comida" 
      | "transporte" 
      | "supermercado" 
      | "salud" 
      | "entretenimiento" 
      | "software" 
      | "educacion" 
      | "hogar" 
      | "servicios" 
      | "trabajo" 
      | "otros"

    await db
      .update(receipts)
      .set({
        status: aiResult.success ? "completed" : "failed",
        merchant: aiResult.merchant,
        expenseDate: aiResult.expenseDate
          ? new Date(aiResult.expenseDate)
          : null,
        totalAmount: aiResult.totalAmount?.toString() ?? null,
        taxAmount: aiResult.taxAmount?.toString() ?? null,
        currency: aiResult.currency,
        paymentMethod: paymentMethodValue,
        documentType: aiResult.documentType,
        categorySuggestion: categoryValue,
        confidenceScore: aiResult.confidenceScore.toString(),
        rawText: aiResult.rawText,
        aiNotes: aiResult.notes,
        aiRawResponse: {
          model: "llama-3.2-11b-vision-preview",
          rawText: aiResult.rawText,
          parsedData: {
            success: aiResult.success,
            merchant: aiResult.merchant,
            expenseDate: aiResult.expenseDate,
            totalAmount: aiResult.totalAmount,
            taxAmount: aiResult.taxAmount,
            currency: aiResult.currency,
            paymentMethod: aiResult.paymentMethod,
            documentType: aiResult.documentType,
            categorySuggestion: aiResult.categorySuggestion,
            confidenceScore: aiResult.confidenceScore,
            rawText: aiResult.rawText,
            notes: aiResult.notes,
          },
          error: aiResult.error,
        },
        updatedAt: new Date(),
      })
      .where(eq(receipts.id, receiptId))

    revalidatePath("/dashboard/receipts")
    return { success: true }
  } catch (error) {
    console.error("AI processing error:", error)

    await db
      .update(receipts)
      .set({
        status: "failed",
        aiRawResponse: { 
          model: "llama-3.2-11b-vision-preview", 
          rawText: "", 
          error: String(error) 
        },
        updatedAt: new Date(),
      })
      .where(eq(receipts.id, receiptId))

    return { error: "AI processing failed" }
  }
}

export async function createExpenseFromReceipt(data: unknown, userId: string) {
  try {
    const validated = createExpenseFromReceiptSchema.parse(data)

    if (!userId) {
      return { error: "No has iniciado sesión. Por favor inicia sesión." }
    }

    const receipt = await db.query.receipts.findFirst({
      where: eq(receipts.id, validated.receiptId),
    })

    if (!receipt) {
      return { error: "El recibo no existe o ya fue eliminado." }
    }

    const [expense] = await db
      .insert(expenses)
      .values({
        userId: userId,
        receiptId: validated.receiptId,
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

    await db
      .update(receipts)
      .set({ 
        merchant: validated.merchant,
        expenseDate: new Date(validated.expenseDate),
        totalAmount: validated.totalAmount.toString(),
        taxAmount: validated.taxAmount?.toString(),
        currency: validated.currency,
        paymentMethod: validated.paymentMethod,
        categorySuggestion: validated.category,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(receipts.id, validated.receiptId))

    revalidatePath("/dashboard/receipts")
    revalidatePath("/dashboard/expenses")
    return { success: true, expense }
  } catch (error) {
    console.error("Create expense error:", error)
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => e.message).join(", ")
      return { error: `Datos inválidos: ${messages}` }
    }
    return { error: "No se pudo crear el gasto desde el recibo. Por favor intenta de nuevo." }
  }
}

export async function updateReceipt(data: unknown) {
  try {
    const validated = updateReceiptSchema.parse(data)

    const existingReceipt = await db.query.receipts.findFirst({
      where: eq(receipts.id, validated.id),
    })

    if (!existingReceipt) {
      return { error: "El recibo no existe o ya fue eliminado." }
    }

    const [receipt] = await db
      .update(receipts)
      .set({
        ...(validated.merchant && { merchant: validated.merchant }),
        ...(validated.expenseDate && { expenseDate: new Date(validated.expenseDate) }),
        ...(validated.totalAmount && { totalAmount: validated.totalAmount.toString() }),
        ...(validated.taxAmount && { taxAmount: validated.taxAmount.toString() }),
        ...(validated.currency && { currency: validated.currency }),
        ...(validated.paymentMethod && { paymentMethod: validated.paymentMethod }),
        ...(validated.category && { categorySuggestion: validated.category }),
        ...(validated.status && { status: validated.status }),
        ...(validated.reviewedAt === true && { reviewedAt: new Date() }),
        updatedAt: new Date(),
      })
      .where(eq(receipts.id, validated.id))
      .returning()

    revalidatePath("/dashboard/receipts")
    return { success: true, receipt }
  } catch (error) {
    console.error("Update receipt error:", error)
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => e.message).join(", ")
      return { error: `Datos inválidos: ${messages}` }
    }
    return { error: "No se pudo actualizar el recibo. Por favor intenta de nuevo." }
  }
}

export async function retryReceiptProcessing(receiptId: string) {
  return processReceiptWithAI(receiptId)
}
