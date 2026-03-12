"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "../../lib/auth-client";
import { getUserInitials } from "@/lib/user-utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardCircleIcon,
  ReceiptTextIcon,
  WalletIcon,
  MoneyIcon,
  ChartIcon,
} from "@hugeicons/core-free-icons";

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

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className="data-[slot=sidebar-menu-button]:p-1.5!"
          >
            <Link href={"#"}>
              <HugeiconsIcon icon={ReceiptTextIcon} />
              AI Expense Manager
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
        <div className="flex items-center gap-3 px-2 py-3">
          <Avatar className="h-9 w-9 rounded-lg">
            <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
            <AvatarFallback className="rounded-lg text-sm">
              {getUserInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user?.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user?.email}
            </span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
