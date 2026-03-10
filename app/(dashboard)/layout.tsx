"use client"

import { useSession, signOut } from "../lib/auth-client"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect } from "react"
import Link from "next/link"

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Receipts", href: "/receipts" },
  { name: "Expenses", href: "/expenses" },
  { name: "Budgets", href: "/budgets" },
  { name: "Reports", href: "/reports" },
]

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const { data: session, isPending: isLoading } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/login")
    }
  }, [session, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
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
          <button
            onClick={() => signOut()}
            className="w-full py-2 px-4 border rounded-md hover:bg-accent"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <header className="border-b">
          <div className="container mx-auto py-4 flex justify-between items-center">
            <div></div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {session.user?.email}
              </span>
            </div>
          </div>
        </header>
        <main className="container mx-auto py-8">{children}</main>
      </div>
    </div>
  )
}
