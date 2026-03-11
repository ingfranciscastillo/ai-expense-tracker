import { ReactNode } from "react"
import Link from "next/link"
import { getSession } from "../lib/auth"
import { SignOutButton } from "./_components/sign-out-button"
import { ModeToggle } from "@/components/ui/mode-toggle"

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Receipts", href: "/dashboard/receipts" },
  { name: "Expenses", href: "/dashboard/expenses" },
  { name: "Budgets", href: "/dashboard/budgets" },
  { name: "Reports", href: "/dashboard/reports" },
]

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getSession()

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 border-r bg-card">
        <div className="p-6">
          <h1 className="text-xl font-bold">AI Expense Manager</h1>
        </div>
        <nav className="px-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-3 py-2 rounded-md hover:bg-accent"
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <SignOutButton />
        </div>
      </aside>

      <div className="flex-1">
        <header className="border-b">
          <div className="container mx-auto py-4 flex justify-between items-center">
            <div></div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <span className="text-sm text-muted-foreground">
                {session?.user?.email}
              </span>
            </div>
          </div>
        </header>
        <main className="container mx-auto py-8">{children}</main>
      </div>
    </div>
  )
}
