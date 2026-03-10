import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  uuid,
  varchar,
  integer,
  decimal,
  jsonb,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";

// ==================== ENUMS ====================

export const receiptStatusEnum = pgEnum("receipt_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const expenseCategoryEnum = pgEnum("expense_category", [
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
]);

export const currencyEnum = pgEnum("currency", [
  "USD",
  "EUR",
  "MXN",
  "COP",
  "ARS",
  "OTHER",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "efectivo",
  "tarjeta_debito",
  "tarjeta_credito",
  "transferencia",
  "otro",
  "desconocido",
]);

export const alertTypeEnum = pgEnum("alert_type", [
  "budget_warning_80",
  "budget_warning_90",
  "budget_exceeded",
  "receipt_processing_failed",
]);

export const alertStatusEnum = pgEnum("alert_status", [
  "unread",
  "read",
  "dismissed",
]);

// ==================== BETTER AUTH TABLES ====================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// ==================== RECEIPTS ====================

export const receipts = pgTable(
  "receipts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),

    // Cloudinary
    cloudinaryPublicId: text("cloudinary_public_id").notNull(),
    cloudinaryUrl: text("cloudinary_url").notNull(),
    originalFilename: text("original_filename").notNull(),
    fileType: varchar("file_type", { length: 10 }).notNull(), // 'image' | 'pdf'

    // Estado del procesamiento
    status: receiptStatusEnum("status").default("pending").notNull(),

    // IA Response (raw + parsed)
    aiRawResponse: jsonb("ai_raw_response").$type<{
      model: string;
      rawText: string;
      parsedData?: Record<string, unknown>;
      error?: string;
    }>(),

    // Datos extraídos (revisables)
    merchant: text("merchant"),
    expenseDate: timestamp("expense_date"),
    totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
    taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }),
    currency: currencyEnum("currency").default("USD"),
    paymentMethod: paymentMethodEnum("payment_method").default("desconocido"),
    documentType: text("document_type"), // 'ticket', 'factura', 'nota'
    categorySuggestion: expenseCategoryEnum("category_suggestion"),
    confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }),
    rawText: text("raw_text"),
    aiNotes: text("ai_notes"),

    // Metadatos
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    receiptUserIdIdx: index("receipt_user_id_idx").on(table.userId),
    receiptStatusIdx: index("receipt_status_idx").on(table.status),
    receiptCreatedAtIdx: index("receipt_created_at_idx").on(table.createdAt),
  }),
);

// ==================== EXPENSES ====================

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),

    // Relación con receipt (opcional - puede ser null si se crea manualmente)
    receiptId: uuid("receipt_id").references(() => receipts.id, {
      onDelete: "set null",
    }),

    // Datos del gasto
    merchant: text("merchant").notNull(),
    description: text("description"),
    expenseDate: timestamp("expense_date").notNull(),
    totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
    taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }),
    currency: currencyEnum("currency").default("USD").notNull(),
    paymentMethod: paymentMethodEnum("payment_method").default("desconocido"),

    // Categorización
    category: expenseCategoryEnum("category").notNull(),

    // Deducible
    isDeductible: boolean("is_deductible").default(false),
    deductibleNotes: text("deductible_notes"),

    // Archivo opcional (para gastos sin receipt)
    attachmentUrl: text("attachment_url"),

    // Metadatos
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    expenseUserIdIdx: index("expense_user_id_idx").on(table.userId),
    expenseDateIdx: index("expense_date_idx").on(table.expenseDate),
    expenseCategoryIdx: index("expense_category_idx").on(table.category),
  }),
);

// ==================== BUDGETS ====================

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),

    // Tipo de presupuesto
    isGlobal: boolean("is_global").default(false).notNull(),
    category: expenseCategoryEnum("category"), // Null si es global

    // Período
    month: integer("month").notNull(), // 1-12
    year: integer("year").notNull(), // 2024, 2025, etc.

    // Monto
    limitAmount: decimal("limit_amount", { precision: 12, scale: 2 }).notNull(),
    currency: currencyEnum("currency").default("USD").notNull(),

    // Metadatos
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    budgetUserIdIdx: index("budget_user_id_idx").on(table.userId),
    budgetPeriodIdx: index("budget_period_idx").on(table.year, table.month),
    uniqueBudget: {
      columns: [table.userId, table.category, table.month, table.year],
      name: "unique_budget_per_period",
    },
  }),
);

// ==================== ALERTS ====================

export const alerts = pgTable(
  "alerts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),

    // Referencia
    budgetId: uuid("budget_id").references(() => budgets.id, {
      onDelete: "cascade",
    }),
    expenseId: uuid("expense_id").references(() => expenses.id, {
      onDelete: "cascade",
    }),

    // Contenido
    type: alertTypeEnum("alert_type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    percentage: decimal("percentage", { precision: 5, scale: 2 }),

    // Estado
    status: alertStatusEnum("alert_status").default("unread").notNull(),

    // Metadatos
    createdAt: timestamp("created_at").defaultNow().notNull(),
    readAt: timestamp("read_at"),
  },
  (table) => ({
    alertUserIdIdx: index("alert_user_id_idx").on(table.userId),
    alertStatusIdx: index("alert_status_idx").on(table.status),
  }),
);

// ==================== EXPORT LOGS ====================

export const exports = pgTable(
  "exports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),

    // Filtros aplicados
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    categories: jsonb("categories").$type<string[]>(),
    includeDeductibleOnly: boolean("include_deductible_only"),

    // Resultado
    format: varchar("format", { length: 10 }).notNull(), // 'csv' | 'pdf'
    fileUrl: text("file_url"),
    recordCount: integer("record_count"),

    // Metadatos
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    exportUserIdIdx: index("export_user_id_idx").on(table.userId),
  }),
);

// ==================== RELATIONS ====================

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  receipts: many(receipts),
  expenses: many(expenses),
  budgets: many(budgets),
  alerts: many(alerts),
  exports: many(exports),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const verificationRelations = relations(verification, ({ one }) => ({
  user: one(user, {
    fields: [verification.identifier],
    references: [user.email],
  }),
}));

export const receiptsRelations = relations(receipts, ({ one, many }) => ({
  user: one(user, {
    fields: [receipts.userId],
    references: [user.id],
  }),
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  receipt: one(receipts, {
    fields: [expenses.receiptId],
    references: [receipts.id],
  }),
  user: one(user, {
    fields: [expenses.userId],
    references: [user.id],
  }),
  budget: one(budgets, {
    fields: [expenses.category],
    references: [budgets.category],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  user: one(user, {
    fields: [budgets.userId],
    references: [user.id],
  }),
  alerts: many(alerts),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  budget: one(budgets, {
    fields: [alerts.budgetId],
    references: [budgets.id],
  }),
  user: one(user, {
    fields: [alerts.userId],
    references: [user.id],
  }),
}));

export const exportsRelations = relations(exports, ({ one }) => ({
  user: one(user, {
    fields: [exports.userId],
    references: [user.id],
  }),
}));

// ==================== TYPE INFERENCES ====================

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Receipt = typeof receipts.$inferSelect;
export type NewReceipt = typeof receipts.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;

export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;

export type Export = typeof exports.$inferSelect;
export type NewExport = typeof exports.$inferInsert;
