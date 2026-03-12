"use client";

import { useSession } from "../../../lib/auth-client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadForm } from "./_components/upload-form";

export default function UploadReceiptPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Upload Receipt</h1>
      <UploadForm userId={session.user.id} />
    </div>
  );
}
