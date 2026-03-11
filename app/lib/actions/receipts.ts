"use server"

import { db } from "../db"
import { receipts, expenses } from "../db/schema"
import { uploadToCloudinary } from "../storage/cloudinary"
import { extractDataFromReceipt } from "../ai/extraction"
import type { ExtractionResult } from "../ai/prompts"
import { createExpenseFromReceiptSchema } from "../validations/receipt"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function uploadReceipt(formData: FormData) {
  try {
    const file = formData.get("file") as File | null

    if (!file) {
      return { error: "No file provided" }
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
        userId: "temp-user", // Will be replaced with actual user ID
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

    revalidatePath("/receipts")
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

export async function createExpenseFromReceipt(data: unknown) {
  try {
    const validated = createExpenseFromReceiptSchema.parse(data)

    const receipt = await db.query.receipts.findFirst({
      where: eq(receipts.id, validated.receiptId),
    })

    if (!receipt) {
      return { error: "Receipt not found" }
    }

    const [expense] = await db
      .insert(expenses)
      .values({
        userId: "temp-user", // Will be replaced with actual user ID
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
      .set({ reviewedAt: new Date() })
      .where(eq(receipts.id, validated.receiptId))

    revalidatePath("/receipts")
    revalidatePath("/expenses")
    return { success: true, expense }
  } catch (error) {
    console.error("Create expense error:", error)
    return { error: "Failed to create expense" }
  }
}

export async function retryReceiptProcessing(receiptId: string) {
  return processReceiptWithAI(receiptId)
}
