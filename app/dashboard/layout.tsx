"use client";

import * as React from "react";
import { DashboardHeader } from "./_components/header";
import { DashboardSidebar } from "./_components/sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main>
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
