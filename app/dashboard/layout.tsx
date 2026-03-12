"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "../lib/auth-client";
import { SignOutButton } from "./_components/sign-out-button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardCircleIcon,
  ReceiptTextIcon,
  WalletIcon,
  MoneyIcon,
  ChartIcon,
  LogoutIcon,
} from "@hugeicons/core-free-icons";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: DashboardCircleIcon,
  },
  {
    name: "Receipts",
    href: "/dashboard/receipts",
    icon: ReceiptTextIcon,
  },
  {
    name: "Expenses",
    href: "/dashboard/expenses",
    icon: MoneyIcon,
  },
  {
    name: "Budgets",
    href: "/dashboard/budgets",
    icon: WalletIcon,
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: ChartIcon,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href={"/"}>
                <HugeiconsIcon icon={ReceiptTextIcon} />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <HugeiconsIcon icon={item.icon} />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuButton size={"lg"}>
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={session.data?.user.image!}
                  alt={session.data?.user.name}
                />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {session.data?.user.name}
                </span>
                <span className="truncate text-xs">
                  {session.data?.user.email}
                </span>
              </div>
            </SidebarMenuButton>
            <SidebarMenuButton asChild>
              <SignOutButton />
            </SidebarMenuButton>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main>
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
