"use client";

import { useSession } from "../../../lib/auth-client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ExpenseForm } from "./_components/expense-form";

export default function NewExpensePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [session, isPending, router]);

  const handleSuccess = () => {
    router.push("/dashboard/expenses");
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-6xl w-full mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Add Expense</h1>
      <ExpenseForm userId={session.user.id} onSuccess={handleSuccess} />
    </div>
  );
}
