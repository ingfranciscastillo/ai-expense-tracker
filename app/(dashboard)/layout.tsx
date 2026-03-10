"use client"

import { useSession } from "../lib/auth-client"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect } from "react"

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
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">AI Expense Manager</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{session.user?.email}</span>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8">{children}</main>
    </div>
  )
}
