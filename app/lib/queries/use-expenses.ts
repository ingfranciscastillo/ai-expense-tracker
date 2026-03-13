import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

export function useExpenses(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.expenses(userId || ""),
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/expenses?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch expenses");
      return res.json();
    },
    enabled: !!userId,
  });
}

export function useDeleteExpense(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete expense");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses(userId || "") });
    },
  });
}
