"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "../../lib/auth-client";
import { useReceipts, useDeleteReceipt } from "../../lib/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UploadIcon, Edit01Icon, MoreHorizontalCircle01Icon, Delete01Icon, FileViewIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { EditReceiptModal } from "./_components/edit-receipt-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ConfirmDialog } from "../_components/confirm-dialog";

const categoryLabels: Record<string, string> = {
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
};

export default function ReceiptsPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const userId = session?.user?.id;
  
  const { data: receipts = [], isLoading } = useReceipts(userId);
  const deleteMutation = useDeleteReceipt(userId);
  
  const [editingReceipt, setEditingReceipt] = useState<any | null>(null);
  const [deletingReceipt, setDeletingReceipt] = useState<any | null>(null);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "processing":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getConfidenceLabel = (score: string | null) => {
    if (!score) return "N/A";
    const num = parseFloat(score);
    if (num >= 0.8) return "Alta";
    if (num >= 0.5) return "Media";
    return "Baja";
  };

  const getCategoryLabel = (category: string | null) => {
    return category ? categoryLabels[category] || category : "-";
  };

  if (sessionPending || isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Loading...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Please log in to view receipts.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Receipts</h1>
        <Button asChild>
          <Link href="/dashboard/receipts/upload" className="gap-2">
            <HugeiconsIcon icon={UploadIcon} size={18} />
            Upload Receipt
          </Link>
        </Button>
      </div>

      <Card>
        {receipts.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="rounded-full bg-muted p-4">
              <HugeiconsIcon
                icon={UploadIcon}
                size={32}
                className="text-muted-foreground"
              />
            </div>
            <p className="text-muted-foreground text-center">
              No receipts yet.
            </p>
            <Button variant="outline" asChild>
              <Link href="/dashboard/receipts/upload">
                Upload your first receipt
              </Link>
            </Button>
          </CardContent>
        ) : (
          <Table className="max-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt: any) => (
                <TableRow key={receipt.id}>
                  <TableCell>
                    {receipt.createdAt
                      ? new Date(receipt.createdAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {receipt.originalFilename}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(receipt.status || "pending")}
                    >
                      {receipt.status || "pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>{receipt.merchant || "-"}</TableCell>
                  <TableCell className="text-right">
                    {receipt.totalAmount
                      ? `${receipt.currency || "$"}${receipt.totalAmount}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {getCategoryLabel(receipt.categorySuggestion)}
                  </TableCell>
                  <TableCell>
                    {getConfidenceLabel(receipt.confidenceScore)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <HugeiconsIcon icon={MoreHorizontalCircle01Icon} size={18} />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {receipt.status === "completed" && (
                          <>
                            <DropdownMenuItem onClick={() => setEditingReceipt(receipt)}>
                              <HugeiconsIcon icon={Edit01Icon} size={16} className="mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/receipts/${receipt.id}`}>
                                <HugeiconsIcon icon={FileViewIcon} size={16} className="mr-2" />
                                Review
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeletingReceipt(receipt)}>
                          <HugeiconsIcon icon={Delete01Icon} size={16} className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {editingReceipt && (
        <EditReceiptModal
          receipt={editingReceipt}
          open={!!editingReceipt}
          onOpenChange={(open) => {
            if (!open) {
              setEditingReceipt(null);
            }
          }}
        />
      )}

      <ConfirmDialog
        open={!!deletingReceipt}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingReceipt(null);
          }
        }}
        onConfirm={async () => {
          if (!deletingReceipt) return;
          try {
            await deleteMutation.mutateAsync(deletingReceipt.id);
            toast.success("Recibo eliminado exitosamente");
          } catch (error: any) {
            toast.error(error.message || "Error al eliminar");
          }
          setDeletingReceipt(null);
        }}
        title="Eliminar recibo"
        description="¿Estás seguro de que deseas eliminar este recibo? Esta acción no se puede deshacer."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
