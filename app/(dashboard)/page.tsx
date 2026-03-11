"use client"

import { useSession } from "../lib/auth-client"

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Welcome back!</h2>
        <p className="text-muted-foreground mt-2">
          {session?.user?.name ?? "User"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Total Expenses</h3>
          <p className="text-2xl font-bold mt-2">$0.00</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">This Month</h3>
          <p className="text-2xl font-bold mt-2">$0.00</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Receipts</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Budget Used</h3>
          <p className="text-2xl font-bold mt-2">0%</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <div className="mt-4 space-y-2">
            <a
              href="/receipts/upload"
              className="block w-full py-2 px-4 text-center border rounded-md hover:bg-accent"
            >
              Upload Receipt
            </a>
            <a
              href="/expenses"
              className="block w-full py-2 px-4 text-center border rounded-md hover:bg-accent"
            >
              View Expenses
            </a>
            <a
              href="/budgets"
              className="block w-full py-2 px-4 text-center border rounded-md hover:bg-accent"
            >
              Manage Budgets
            </a>
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <p className="text-muted-foreground mt-4 text-sm">
            No recent activity yet. Upload your first receipt to get started.
          </p>
        </div>
      </div>
    </div>
  )
}
