import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import { deleteBudget } from "../actions/budgets";

export function useBudgetsWithProgress(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.budgets(userId || ""),
    queryFn: async () => {
      if (!userId) return [];
      
      const [budgetsRes, expensesRes] = await Promise.all([
        fetch(`/api/budgets?userId=${userId}`),
        fetch(`/api/expenses?userId=${userId}`),
      ]);
      
      const budgetsData = await budgetsRes.json();
      const expensesData = await expensesRes.json();
      
      if (!Array.isArray(budgetsData)) return [];
      
      const expenses = Array.isArray(expensesData) ? expensesData : [];
      
      const budgetsWithProgress = budgetsData.map((budget: any) => {
        const budgetMonth = budget.month;
        const budgetYear = budget.year;
        
        const relevantExpenses = expenses.filter((expense: any) => {
          const expenseDate = new Date(expense.expenseDate);
          const expenseMonth = expenseDate.getMonth() + 1;
          const expenseYear = expenseDate.getFullYear();
          
          if (budget.isGlobal) {
            return expenseMonth === budgetMonth && expenseYear === budgetYear;
          }
          
          return (
            expense.category === budget.category &&
            expenseMonth === budgetMonth &&
            expenseYear === budgetYear
          );
        });
        
        const totalSpent = relevantExpenses.reduce(
          (sum: number, expense: any) => sum + parseFloat(expense.totalAmount || "0"),
          0
        );
        
        const limitAmount = parseFloat(budget.limitAmount || "0");
        const percentage = limitAmount > 0 ? (totalSpent / limitAmount) * 100 : 0;
        
        return {
          ...budget,
          totalSpent,
          percentage: Math.min(percentage, 100),
        };
      });
      
      return budgetsWithProgress;
    },
    enabled: !!userId,
  });
}

export function useDeleteBudget(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets(userId || "") });
    },
  });
}
