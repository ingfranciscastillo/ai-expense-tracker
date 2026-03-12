import { getReceiptById } from "../../../lib/actions/receipts";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { ReviewForm } from "./_components/review-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReceiptReviewPage({ params }: Props) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userId = session?.user.id;

  const receipt = await getReceiptById(id);

  if (!receipt) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold">Receipt not found</h1>
      </div>
    );
  }

  if (receipt.status !== "completed") {
    redirect("/dashboard/receipts");
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Review Receipt</h1>

      <div className="grid gap-8 md:grid-cols-2">
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

        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Extracted Data</h2>

          {receipt.aiNotes && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded text-sm">
              <strong>Note:</strong> {receipt.aiNotes}
            </div>
          )}

          <ReviewForm
            receiptId={id}
            userId={userId!}
            initialData={{
              merchant: receipt.merchant,
              expenseDate: receipt.expenseDate,
              totalAmount: receipt.totalAmount,
              taxAmount: receipt.taxAmount,
              currency: receipt.currency,
              paymentMethod: receipt.paymentMethod,
              categorySuggestion: receipt.categorySuggestion,
              aiNotes: receipt.aiNotes,
            }}
          />
        </div>
      </div>
    </div>
  );
}
