"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "../../lib/auth-client"

export default function ReceiptsPage() {
  const { data: session, isPending } = useSession()
  const [receipts, setReceipts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchReceipts(session.user.id)
    }
  }, [session])

  async function fetchReceipts(userId: string) {
    try {
      const res = await fetch(`/api/receipts?userId=${userId}`)
      const data = await res.json()
      setReceipts(data)
    } catch (error) {
      console.error("Failed to fetch receipts:", error)
    } finally {
      setLoading(false)
    }
  }

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

  const getCategoryLabel = (category: string | null) => {
    const labels: Record<string, string> = {
      comida: "Comida",
      transporte: "Transporte",
      supermercado: "Supermercado",
      salud: "Salud",
      entretenimiento: "Entretenimiento",
      software: "Software",
      educacion: "Educación",
      hogar: "Hogar",
      servicios: "Servicios",
      trabajo: "Trabajo",
      otros: "Otros",
    }
    return category ? labels[category] || category : "-"
  }

  if (isPending || loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (!session) {
    return <div className="p-8 text-center">Please log in to view receipts.</div>
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Receipts</h1>
        <Link
          href="/dashboard/receipts/upload"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Upload Receipt
        </Link>
      </div>

      {receipts.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground mb-4">No receipts yet</p>
          <Link
            href="/dashboard/receipts/upload"
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
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((receipt) => (
                <tr key={receipt.id} className="border-t">
                  <td className="px-4 py-3 text-sm">
                    {receipt.createdAt 
                      ? new Date(receipt.createdAt).toLocaleDateString() 
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">{receipt.originalFilename}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        receipt.status || "pending"
                      )}`}
                    >
                      {receipt.status || "pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{receipt.merchant || "-"}</td>
                  <td className="px-4 py-3 text-sm">
                    {receipt.totalAmount 
                      ? `${receipt.currency || "$"}${receipt.totalAmount}` 
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {getCategoryLabel(receipt.categorySuggestion)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {getConfidenceLabel(receipt.confidenceScore)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {receipt.status === "completed" && (
                      <Link
                        href={`/dashboard/receipts/${receipt.id}`}
                        className="text-primary hover:underline"
                      >
                        Review
                      </Link>
                    )}
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
