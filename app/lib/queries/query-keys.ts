export const queryKeys = {
  expenses: (userId: string) => ["expenses", userId] as const,
  budgets: (userId: string) => ["budgets", userId] as const,
  receipts: (userId: string) => ["receipts", userId] as const,
};
