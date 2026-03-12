import { z } from "zod"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"]

export const uploadReceiptSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "El archivo no puede exceder 10MB",
    })
    .refine(
      (file) => ACCEPTED_TYPES.includes(file.type),
      "Tipo de archivo no permitido. Usa: JPEG, PNG, WebP o PDF"
    ),
})

export const createExpenseFromReceiptSchema = z.object({
  receiptId: z.string().uuid(),
  merchant: z.string().min(1, "El comercio es obligatorio"),
  description: z.string().optional(),
  expenseDate: z.string().min(1, "La fecha es obligatoria"),
  totalAmount: z.coerce.number().positive("El monto debe ser positivo"),
  taxAmount: z.coerce.number().min(0).optional(),
  currency: z.enum([
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "CNY",
    "CAD",
    "AUD",
    "BRL",
    "CLP",
    "COP",
    "ARS",
    "PEN",
    "UYU",
    "MXN",
    "OTHER",
  ]).default("USD"),
  paymentMethod: z
    .enum([
      "efectivo",
      "tarjeta_debito",
      "tarjeta_credito",
      "transferencia",
      "otro",
      "desconocido",
    ])
    .default("desconocido"),
  category: z.enum([
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
    "otros",
  ]),
  isDeductible: z.boolean().default(false),
  deductibleNotes: z.string().optional(),
})

export const createExpenseManualSchema = z.object({
  merchant: z.string().min(1, "El comercio es obligatorio"),
  description: z.string().optional(),
  expenseDate: z.string().min(1, "La fecha es obligatoria"),
  totalAmount: z.coerce.number().positive("El monto debe ser positivo"),
  taxAmount: z.coerce.number().min(0).optional(),
  currency: z.enum([
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "CNY",
    "CAD",
    "AUD",
    "BRL",
    "CLP",
    "COP",
    "ARS",
    "PEN",
    "UYU",
    "MXN",
    "OTHER",
  ]).default("USD"),
  paymentMethod: z
    .enum([
      "efectivo",
      "tarjeta_debito",
      "tarjeta_credito",
      "transferencia",
      "otro",
      "desconocido",
    ])
    .default("desconocido"),
  category: z.enum([
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
    "otros",
  ]),
  isDeductible: z.boolean().default(false),
  deductibleNotes: z.string().optional(),
})

export const updateExpenseSchema = z.object({
  id: z.string().uuid(),
  merchant: z.string().min(1).optional(),
  description: z.string().optional(),
  expenseDate: z.string().optional(),
  totalAmount: z.coerce.number().positive().optional(),
  taxAmount: z.coerce.number().min(0).optional(),
  currency: z
    .enum([
      "USD",
      "EUR",
      "GBP",
      "JPY",
      "CNY",
      "CAD",
      "AUD",
      "BRL",
      "CLP",
      "COP",
      "ARS",
      "PEN",
      "UYU",
      "MXN",
      "OTHER",
    ])
    .optional(),
  paymentMethod: z
    .enum([
      "efectivo",
      "tarjeta_debito",
      "tarjeta_credito",
      "transferencia",
      "otro",
      "desconocido",
    ])
    .optional(),
  category: z
    .enum([
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
      "otros",
    ])
    .optional(),
  isDeductible: z.boolean().optional(),
  deductibleNotes: z.string().optional(),
})

export const updateReceiptSchema = z.object({
  id: z.string().uuid(),
  merchant: z.string().optional(),
  expenseDate: z.string().optional(),
  totalAmount: z.coerce.number().positive().optional(),
  taxAmount: z.coerce.number().min(0).optional(),
  currency: z
    .enum([
      "USD",
      "EUR",
      "GBP",
      "JPY",
      "CNY",
      "CAD",
      "AUD",
      "BRL",
      "CLP",
      "COP",
      "ARS",
      "PEN",
      "UYU",
      "MXN",
      "OTHER",
    ])
    .optional(),
  paymentMethod: z
    .enum([
      "efectivo",
      "tarjeta_debito",
      "tarjeta_credito",
      "transferencia",
      "otro",
      "desconocido",
    ])
    .optional(),
  category: z
    .enum([
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
      "otros",
    ])
    .optional(),
  status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
  reviewedAt: z.boolean().optional(),
})

export const updateBudgetSchema = z.object({
  id: z.string().uuid(),
  isGlobal: z.boolean().optional(),
  category: z
    .enum([
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
      "otros",
    ])
    .optional(),
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2020).max(2100).optional(),
  limitAmount: z.coerce.number().positive("El límite debe ser positivo").optional(),
  currency: z.enum([
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "CNY",
    "CAD",
    "AUD",
    "BRL",
    "CLP",
    "COP",
    "ARS",
    "PEN",
    "UYU",
    "MXN",
    "OTHER",
  ]).optional(),
})

export const createBudgetSchema = z.object({
  isGlobal: z.boolean(),
  category: z
    .enum([
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
      "otros",
    ])
    .optional(),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020).max(2100),
  limitAmount: z.coerce.number().positive("El límite debe ser positivo"),
  currency: z.enum([
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "CNY",
    "CAD",
    "AUD",
    "BRL",
    "CLP",
    "COP",
    "ARS",
    "PEN",
    "UYU",
    "MXN",
    "OTHER",
  ]).default("USD"),
})

export const exportSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  categories: z.array(z.string()).optional(),
  includeDeductibleOnly: z.boolean().optional(),
  format: z.enum(["csv", "pdf"]),
})
