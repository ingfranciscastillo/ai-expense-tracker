import { NextResponse } from "next/server"
import { exportExpensesToCSV } from "../../../lib/actions/reports"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { startDate, endDate, categories, includeDeductibleOnly, userId } = body

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start and end dates are required" },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const csv = await exportExpensesToCSV(userId, {
      startDate,
      endDate,
      categories,
      includeDeductibleOnly,
    })

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="expenses_${startDate}_${endDate}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      { error: "Failed to export expenses" },
      { status: 500 }
    )
  }
}
