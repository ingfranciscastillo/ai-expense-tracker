"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Receipt {
  id: string
  originalFilename: string
  status: string
  merchant: string | null
  totalAmount: string | null
  categorySuggestion: string | null
  confidenceScore: string | null
  createdAt: string
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would be a server action or API call
    // For now, we'll show an empty state
    setIsLoading(false)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConfidenceLabel = (score: string | null) => {
    if (!score) return "N/A"
    const num = parseFloat(score)
    if (num >= 0.8) return "Alta"
    if (num >= 0.5) return "Media"
    return "Baja"
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Receipts</h1>
        <Link
          href="/receipts/upload"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Upload Receipt
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : receipts.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground mb-4">No receipts yet</p>
          <Link
            href="/receipts/upload"
            className="text-primary hover:underline"
          >
            Upload your first receipt
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">File</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Merchant</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((receipt) => (
                <tr key={receipt.id} className="border-t">
                  <td className="px-4 py-3 text-sm">
                    {new Date(receipt.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">{receipt.originalFilename}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        receipt.status
                      )}`}
                    >
                      {receipt.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{receipt.merchant || "-"}</td>
                  <td className="px-4 py-3 text-sm">{receipt.totalAmount || "-"}</td>
                  <td className="px-4 py-3 text-sm">{receipt.categorySuggestion || "-"}</td>
                  <td className="px-4 py-3 text-sm">
                    {getConfidenceLabel(receipt.confidenceScore)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
