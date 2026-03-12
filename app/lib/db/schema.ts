import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
  uuid,
  varchar,
  integer,
  decimal,
  jsonb,
  pgEnum,
  unique,
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
    .defaultNow()                                  // FIX: defaultNow() añadido
    .$onUpdate(() => new Date())
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
      .defaultNow()                                // FIX: faltaba defaultNow(), causaba error en INSERT
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [
    index("session_user_id_idx").on(t.userId),
    index("session_expires_at_idx").on(t.expiresAt), // FIX: útil para limpiar sesiones expiradas
  ],
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
      .defaultNow()                                // FIX: defaultNow() añadido
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("account_user_id_idx").on(t.userId),
    uniqueIndex("account_provider_account_idx").on(t.providerId, t.accountId), // FIX: un usuario no puede tener dos cuentas del mismo provider
  ],
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
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("verification_identifier_idx").on(t.identifier),
    index("verification_expires_at_idx").on(t.expiresAt), // FIX: útil para limpiar tokens expirados
  ],
  // FIX: eliminada la relación falsa con user — verification es genérica en Better Auth
);

// ==================== RECEIPTS ====================

export const receipts = pgTable(
  "receipts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Cloudinary
    cloudinaryPublicId: text("cloudinary_public_id").notNull().unique(), // FIX: unique — no puede haber dos receipts con el mismo asset
    cloudinaryUrl: text("cloudinary_url").notNull(),
    originalFilename: text("original_filename").notNull(),
    fileType: varchar("file_type", { length: 10 }).notNull(),

    // Estado
    status: receiptStatusEnum("status").default("pending").notNull(),

    // IA Response
    aiRawResponse: jsonb("ai_raw_response").$type<{
      model: string;
      rawText: string;
      parsedData?: Record<string, unknown>;
      error?: string;
    }>(),

    // Datos extraídos
    merchant: text("merchant"),
    expenseDate: timestamp("expense_date"),
    totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
    taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }),
    currency: currencyEnum("currency").default("USD"),
    paymentMethod: paymentMethodEnum("payment_method").default("desconocido"),
    documentType: text("document_type"),
    categorySuggestion: expenseCategoryEnum("category_suggestion"),
    confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }),
    rawText: text("raw_text"),
    aiNotes: text("ai_notes"),

    // Metadatos
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()) // FIX: faltaba $onUpdate
      .notNull(),
  },
  (t) => [
    index("receipt_user_id_idx").on(t.userId),
    index("receipt_status_idx").on(t.status),
    index("receipt_created_at_idx").on(t.createdAt),
    index("receipt_user_status_idx").on(t.userId, t.status), // FIX: compuesto — el query más común filtra por ambos
  ],
);

// ==================== EXPENSES ====================

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    receiptId: uuid("receipt_id").references(() => receipts.id, {
      onDelete: "set null",
    }),

    budgetId: uuid("budget_id").references(() => budgets.id, {
      onDelete: "set null",
    }),

    merchant: text("merchant").notNull(),
    description: text("description"),
    expenseDate: timestamp("expense_date").notNull(),
    totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
    taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }),
    currency: currencyEnum("currency").default("USD").notNull(),
    paymentMethod: paymentMethodEnum("payment_method").default("desconocido"),

    category: expenseCategoryEnum("category").notNull(),

    isDeductible: boolean("is_deductible").default(false).notNull(),
    deductibleNotes: text("deductible_notes"),

    attachmentUrl: text("attachment_url"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("expense_user_id_idx").on(t.userId),
    index("expense_date_idx").on(t.expenseDate),
    index("expense_category_idx").on(t.category),
    index("expense_user_date_idx").on(t.userId, t.expenseDate),
    index("expense_receipt_id_idx").on(t.receiptId),
    index("expense_budget_id_idx").on(t.budgetId),
  ],
);

// ==================== BUDGETS ====================

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    isGlobal: boolean("is_global").default(false).notNull(),
    category: expenseCategoryEnum("category"),

    month: integer("month").notNull(),
    year: integer("year").notNull(),

    limitAmount: decimal("limit_amount", { precision: 12, scale: 2 }).notNull(),
    currency: currencyEnum("currency").default("USD").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("budget_user_id_idx").on(t.userId),
    index("budget_period_idx").on(t.year, t.month),
    unique("unique_budget_per_period").on(t.userId, t.category, t.month, t.year),
  ],
);

// ==================== ALERTS ====================

export const alerts = pgTable(
  "alerts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    budgetId: uuid("budget_id").references(() => budgets.id, {
      onDelete: "cascade",
    }),
    expenseId: uuid("expense_id").references(() => expenses.id, {
      onDelete: "cascade",
    }),
    receiptId: uuid("receipt_id").references(() => receipts.id, {
      onDelete: "cascade",
    }),

    type: alertTypeEnum("alert_type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    percentage: decimal("percentage", { precision: 5, scale: 2 }),

    status: alertStatusEnum("alert_status").default("unread").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    readAt: timestamp("read_at"),
  },
  (t) => [
    index("alert_user_id_idx").on(t.userId),
    index("alert_status_idx").on(t.status),
    index("alert_user_status_idx").on(t.userId, t.status),
    index("alert_budget_id_idx").on(t.budgetId),
    index("alert_expense_id_idx").on(t.expenseId),
    index("alert_receipt_id_idx").on(t.receiptId),
  ],
);

// ==================== EXPORT LOGS ====================

export const exportLogs = pgTable(
  "export_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    categories: jsonb("categories").$type<string[]>(),
    includeDeductibleOnly: boolean("include_deductible_only").default(false).notNull(),

    format: varchar("format", { length: 10 }).notNull(),
    fileUrl: text("file_url"),
    recordCount: integer("record_count"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("export_user_id_idx").on(t.userId),
    index("export_created_at_idx").on(t.createdAt),
  ],
);

// ==================== RELATIONS ====================

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  receipts: many(receipts),
  expenses: many(expenses),
  budgets: many(budgets),
  alerts: many(alerts),
  exportLogs: many(exportLogs),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));


export const receiptsRelations = relations(receipts, ({ one, many }) => ({
  user: one(user, { fields: [receipts.userId], references: [user.id] }),
  expenses: many(expenses),
  alerts: many(alerts),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(user, { fields: [expenses.userId], references: [user.id] }),
  receipt: one(receipts, { fields: [expenses.receiptId], references: [receipts.id] }),
  budget: one(budgets, { fields: [expenses.budgetId], references: [budgets.id] }),
}));

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  user: one(user, { fields: [budgets.userId], references: [user.id] }),
  expenses: many(expenses),
  alerts: many(alerts),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(user, { fields: [alerts.userId], references: [user.id] }),
  budget: one(budgets, { fields: [alerts.budgetId], references: [budgets.id] }),
  expense: one(expenses, { fields: [alerts.expenseId], references: [expenses.id] }),
  receipt: one(receipts, { fields: [alerts.receiptId], references: [receipts.id] }),
}));

export const exportLogsRelations = relations(exportLogs, ({ one }) => ({
  user: one(user, { fields: [exportLogs.userId], references: [user.id] }),
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

export type ExportLog = typeof exportLogs.$inferSelect;
export type NewExportLog = typeof exportLogs.$inferInsert;