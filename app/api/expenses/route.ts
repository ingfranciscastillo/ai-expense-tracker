import { NextRequest, NextResponse } from "next/server"
import { getExpenses } from "../../lib/actions/expenses"

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const expenses = await getExpenses(userId)
    return NextResponse.json(expenses)
  } catch (error) {
    console.error("Failed to fetch expenses:", error)
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
  }
}
