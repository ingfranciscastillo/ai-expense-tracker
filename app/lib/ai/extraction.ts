import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { EXTRACTION_SYSTEM_PROMPT, type ExtractionResult } from "./prompts"

export async function extractDataFromReceipt(
  imageUrl: string
): Promise<ExtractionResult> {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    return {
      success: false,
      error: "GROQ_API_KEY not configured",
      merchant: null,
      expenseDate: null,
      totalAmount: null,
      taxAmount: 0,
      currency: "OTHER",
      paymentMethod: null,
      documentType: null,
      categorySuggestion: "otros",
      confidenceScore: 0,
      rawText: "",
      notes: "API key not configured",
    }
  }

  try {
    console.log("Starting AI extraction with image URL:", imageUrl.substring(0, 50) + "...")
    
    const result = await generateText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      messages: [
        {
          role: "system",
          content: EXTRACTION_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "image",
              image: imageUrl,
            },
          ],
        },
      ],
    })

    console.log("AI response received, text length:", result.text.length)
    console.log("First 200 chars:", result.text.substring(0, 200))

    const text = result.text

    return parseAIResponse(text)
  } catch (error) {
    console.error("AI extraction error:", error)
    console.error("Error name:", error instanceof Error ? error.name : "Unknown")
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    return {
      success: false,
      error: String(error),
      merchant: null,
      expenseDate: null,
      totalAmount: null,
      taxAmount: 0,
      currency: "OTHER",
      paymentMethod: null,
      documentType: null,
      categorySuggestion: "otros",
      confidenceScore: 0,
      rawText: "",
      notes: "Error al procesar con IA",
    }
  }
}

function parseAIResponse(content: string): ExtractionResult {
  try {
    // Limpiar backticks y markdown wrapper
    const cleaned = content
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim()
    
    const parsed = JSON.parse(cleaned)

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error || "Unknown error",
        merchant: null,
        expenseDate: null,
        totalAmount: null,
        taxAmount: 0,
        currency: "OTHER",
        paymentMethod: null,
        documentType: null,
        categorySuggestion: "otros",
        confidenceScore: 0,
        rawText: "",
        notes: parsed.error,
      }
    }

    return {
      success: true,
      merchant: parsed.merchant ?? null,
      expenseDate: parsed.expenseDate ?? null,
      totalAmount: parsed.totalAmount != null ? Number(parsed.totalAmount) : null,
      taxAmount: Number(parsed.taxAmount) || 0,
      currency: normalizeCurrency(parsed.currency),
      paymentMethod: parsed.paymentMethod ?? null,
      documentType: parsed.documentType ?? null,
      categorySuggestion: normalizeCategory(parsed.categorySuggestion),
      confidenceScore: Number(parsed.confidenceScore) || 0,
      rawText: parsed.rawText || "",
      notes: parsed.notes ?? null,
    }
  } catch (error) {
    console.error("Parse error:", error)
    return {
      success: false,
      error: "Invalid JSON response from AI",
      merchant: null,
      expenseDate: null,
      totalAmount: null,
      taxAmount: 0,
      currency: "OTHER",
      paymentMethod: null,
      documentType: null,
      categorySuggestion: "otros",
      confidenceScore: 0,
      rawText: content,
      notes: "Error al parsear respuesta de IA",
    }
  }
}

function normalizeCurrency(currency: string | undefined): ExtractionResult["currency"] {
  const validCurrencies = ["USD", "EUR", "MXN", "COP", "ARS", "OTHER"]
  if (!currency) return "OTHER"
  
  const normalized = currency.toUpperCase()
  return validCurrencies.includes(normalized) 
    ? normalized as ExtractionResult["currency"] 
    : "OTHER"
}

function normalizeCategory(category: string | undefined): ExtractionResult["categorySuggestion"] {
  const validCategories = [
    "comida", 
    "transporte", 
    "supermercado", 
    "salud", 
    "entretenimiento", 
    "software", 
    "educacion", 
    "hogar", 
    "servicios", 
    "trabajo", 
    "otros"
  ]
  
  if (!category) return "otros"
  
  const normalized = category.toLowerCase().replace("í", "i").replace("á", "a")
  return validCategories.includes(normalized) 
    ? normalized as ExtractionResult["categorySuggestion"] 
    : "otros"
}
