import { NextRequest, NextResponse } from "next/server"
import { getReceipts } from "../../lib/actions/receipts"

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const receipts = await getReceipts(userId)
    return NextResponse.json(receipts)
  } catch (error) {
    console.error("Failed to fetch receipts:", error)
    return NextResponse.json({ error: "Failed to fetch receipts" }, { status: 500 })
  }
}
