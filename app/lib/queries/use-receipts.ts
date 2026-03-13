import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import { deleteReceipt } from "../actions/receipts";

export function useReceipts(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.receipts(userId || ""),
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/receipts?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch receipts");
      return res.json();
    },
    enabled: !!userId,
  });
}

export function useDeleteReceipt(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReceipt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts(userId || "") });
    },
  });
}
