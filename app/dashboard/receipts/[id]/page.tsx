import { getReceiptById } from "../../../lib/actions/receipts"
import { createExpenseFromReceipt } from "../../../lib/actions/receipts"
import { redirect } from "next/navigation"
import { getUserId } from "../../../lib/auth"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ReceiptReviewPage({ params }: Props) {
  const { id } = await params
  const userId = await getUserId()
  
  if (!userId) {
    redirect("/login")
  }
  
  const receipt = await getReceiptById(id)

  if (!receipt) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold">Receipt not found</h1>
      </div>
    )
  }

  if (receipt.status !== "completed") {
    redirect("/dashboard/receipts")
  }

  async function createExpense(formData: FormData) {
    "use server"
    
    const userId = await getUserId()
    if (!userId) {
      redirect("/login")
    }
    
    const data = {
      receiptId: id,
      merchant: formData.get("merchant") as string,
      description: formData.get("description") as string | undefined,
      expenseDate: formData.get("expenseDate") as string,
      totalAmount: parseFloat(formData.get("totalAmount") as string),
      taxAmount: formData.get("taxAmount") ? parseFloat(formData.get("taxAmount") as string) : undefined,
      currency: formData.get("currency") as any,
      paymentMethod: formData.get("paymentMethod") as any,
      category: formData.get("category") as any,
      isDeductible: formData.get("isDeductible") === "on",
      deductibleNotes: formData.get("deductibleNotes") as string | undefined,
    }

    const result = await createExpenseFromReceipt(data, userId!)
    
    if (result.success) {
      redirect("/dashboard/expenses")
    }
  }

  const categoryLabel = (category: string | null) => {
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
    return category ? labels[category] || category : "otros"
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Review Receipt</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Receipt Image */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Receipt Image</h2>
          {receipt.fileType === "pdf" ? (
            <iframe
              src={receipt.cloudinaryUrl}
              className="w-full h-96 rounded"
              title="Receipt PDF"
            />
          ) : (
            <img
              src={receipt.cloudinaryUrl}
              alt="Receipt"
              className="w-full rounded"
            />
          )}
        </div>

        {/* Extracted Data Form */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Extracted Data</h2>
          
          {receipt.aiNotes && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded text-sm">
              <strong>Note:</strong> {receipt.aiNotes}
            </div>
          )}

          <form action={createExpense} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Merchant</label>
              <input
                name="merchant"
                defaultValue={receipt.merchant || ""}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                name="expenseDate"
                type="date"
                defaultValue={receipt.expenseDate 
                  ? new Date(receipt.expenseDate).toISOString().split("T")[0] 
                  : ""}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Total Amount</label>
                <input
                  name="totalAmount"
                  type="number"
                  step="0.01"
                  defaultValue={receipt.totalAmount || ""}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tax Amount</label>
                <input
                  name="taxAmount"
                  type="number"
                  step="0.01"
                  defaultValue={receipt.taxAmount || ""}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <select
                  name="currency"
                  defaultValue={receipt.currency || "USD"}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="MXN">MXN</option>
                  <option value="COP">COP</option>
                  <option value="ARS">ARS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  defaultValue={receipt.paymentMethod || "desconocido"}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta_debito">Tarjeta Débito</option>
                  <option value="tarjeta_credito">Tarjeta Crédito</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="desconocido">Desconocido</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                defaultValue={receipt.categorySuggestion || "otros"}
                required
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="comida">Comida</option>
                <option value="transporte">Transporte</option>
                <option value="supermercado">Supermercado</option>
                <option value="salud">Salud</option>
                <option value="entretenimiento">Entretenimiento</option>
                <option value="software">Software</option>
                <option value="educacion">Educación</option>
                <option value="hogar">Hogar</option>
                <option value="servicios">Servicios</option>
                <option value="trabajo">Trabajo</option>
                <option value="otros">Otros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                rows={2}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                name="isDeductible"
                type="checkbox"
                id="isDeductible"
                className="w-4 h-4"
              />
              <label htmlFor="isDeductible" className="text-sm font-medium">
                Tax Deductible
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Deductible Notes</label>
              <textarea
                name="deductibleNotes"
                rows={2}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Confirm & Create Expense
              </button>
              <a
                href="/dashboard/receipts"
                className="flex-1 py-2 px-4 border rounded-md hover:bg-accent text-center"
              >
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
