"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "../../lib/auth-client";
import { ExpensesCharts } from "./expenses-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ReceiptTextIcon,
  MoneyIcon,
  WalletIcon,
  UploadIcon,
} from "@hugeicons/core-free-icons";

interface DashboardContentProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function DashboardContent({ user }: DashboardContentProps) {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalExpenses: 0,
    thisMonth: 0,
    receiptsCount: 0,
    budgetUsed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData(session.user.id);
    } else {
      setLoading(false);
    }
  }, [session]);

  async function fetchDashboardData(userId: string) {
    try {
      const [expensesRes, receiptsRes] = await Promise.all([
        fetch(`/api/expenses?userId=${userId}`),
        fetch(`/api/receipts?userId=${userId}`),
      ]);

      const expenses = (await expensesRes.json()) || [];
      const receipts = (await receiptsRes.json()) || [];

      if (!Array.isArray(expenses) || !Array.isArray(receipts)) {
        setLoading(false);
        return;
      }

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const thisMonthExpenses = expenses.filter((e: any) => {
        const expenseDate = new Date(e.expenseDate);
        return (
          expenseDate.getMonth() === currentMonth &&
          expenseDate.getFullYear() === currentYear
        );
      });

      const totalExpenses = expenses.reduce(
        (sum: number, e: any) => sum + (Number(e.totalAmount) || 0),
        0,
      );
      const thisMonthTotal = thisMonthExpenses.reduce(
        (sum: number, e: any) => sum + (Number(e.totalAmount) || 0),
        0,
      );

      setStats({
        totalExpenses,
        thisMonth: thisMonthTotal,
        receiptsCount: receipts.length || 0,
        budgetUsed: 0,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 w-full">
      <div>
        <h2 className="text-3xl font-bold">Welcome back!</h2>
        <p className="text-muted-foreground mt-2">{user?.name ?? "User"}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {loading ? "..." : `$${stats.totalExpenses.toFixed(2)}`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {loading ? "..." : `$${stats.thisMonth.toFixed(2)}`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receipts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {loading ? "..." : stats.receiptsCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {loading ? "..." : `${stats.budgetUsed}%`}
            </p>
          </CardContent>
        </Card>
      </div>

      <ExpensesCharts />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="outline" asChild>
              <Link
                href="/dashboard/receipts/upload"
                className="w-full justify-start gap-2"
              >
                <HugeiconsIcon icon={UploadIcon} size={18} />
                Upload Receipt
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link
                href="/dashboard/expenses"
                className="w-full justify-start gap-2"
              >
                <HugeiconsIcon icon={MoneyIcon} size={18} />
                View Expenses
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link
                href="/dashboard/budgets"
                className="w-full justify-start gap-2"
              >
                <HugeiconsIcon icon={WalletIcon} size={18} />
                Manage Budgets
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {stats.receiptsCount > 0
                ? `You have ${stats.receiptsCount} receipt${stats.receiptsCount > 1 ? "s" : ""} and ${stats.totalExpenses > 0 ? `$${stats.totalExpenses.toFixed(2)} in expenses` : "no expenses"} recorded.`
                : "No recent activity yet. Upload your first receipt to get started."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
