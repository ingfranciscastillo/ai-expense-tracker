"use client";

import { Suspense } from "react";
import { DashboardContent } from "./_components/dashboard-content";
import { useSession } from "../lib/auth-client";

function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        <div className="h-4 w-32 bg-muted rounded animate-pulse mt-2"></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 border rounded-lg">
            <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-muted rounded animate-pulse mt-2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data } = useSession();

  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent user={data?.user} />
    </Suspense>
  );
}
