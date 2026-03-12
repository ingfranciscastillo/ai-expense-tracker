"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "../../lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UploadIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

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
  const { data: session, isPending } = useSession();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchReceipts(session.user.id);
    }
  }, [session]);

  async function fetchReceipts(userId: string) {
    try {
      const res = await fetch(`/api/receipts?userId=${userId}`);
      const data = await res.json();
      setReceipts(data);
    } catch (error) {
      console.error("Failed to fetch receipts:", error);
    } finally {
      setLoading(false);
    }
  }

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

  if (isPending || loading) {
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => (
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
                    {receipt.status === "completed" && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/receipts/${receipt.id}`}>
                          Review
                        </Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
