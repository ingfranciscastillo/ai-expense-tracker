import { NextRequest, NextResponse } from "next/server"
import { getBudgets } from "../../lib/actions/budgets"

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const budgets = await getBudgets(userId)
    return NextResponse.json(budgets)
  } catch (error) {
    console.error("Failed to fetch budgets:", error)
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 })
  }
}
