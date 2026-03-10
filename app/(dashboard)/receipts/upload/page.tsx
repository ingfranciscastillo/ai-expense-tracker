"use client"

import { useState } from "react"
import { uploadReceipt } from "../../../lib/actions/receipts"

export default function UploadReceiptPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const file = formData.get("file") as File

    if (!file || file.size === 0) {
      setMessage({ type: "error", text: "Por favor selecciona un archivo" })
      setIsLoading(false)
      return
    }

    try {
      const result = await uploadReceipt(formData)

      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else {
        setMessage({ type: "success", text: "Receipt uploaded! Processing with AI..." })
        e.currentTarget.reset()
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Upload Receipt</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div
            className={`p-4 rounded-md ${
              message.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div>
          <label htmlFor="file" className="block text-sm font-medium mb-2">
            Select Image or PDF
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="w-full p-2 border rounded-md"
            required
          />
          <p className="text-sm text-muted-foreground mt-1">
            Accepted formats: JPEG, PNG, WebP, PDF (max 10MB)
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? "Uploading..." : "Upload Receipt"}
        </button>
      </form>

      <div className="mt-8">
        <a href="/receipts" className="text-primary hover:underline">
          ← Back to Receipts
        </a>
      </div>
    </div>
  )
}
