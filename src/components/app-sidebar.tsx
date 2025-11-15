import { NavFooter } from "@/components/nav-footer";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { type NavItem } from "@/types";
import Link from "next/link";
import {
  FolderTree,
  LayoutGrid,
  Package,
  PackageCheck,
  Settings,
  ShoppingCart,
  Ticket,
} from "lucide-react";
import AppLogo from "./app-logo";

const mainNavItems: NavItem[] = [
  {
    title: "Panel de control",
    href: "/dashboard",
    icon: LayoutGrid,
  },
  {
    title: "Categorías",
    href: "/dashboard/categories",
    icon: FolderTree,
  },
  {
    title: "Productos",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Cupones",
    href: "/dashboard/coupons",
    icon: Ticket,
  },
  {
    title: "Pedidos",
    href: "/dashboard/orders",
    icon: PackageCheck,
  },
  {
    title: "Carritos",
    href: "/dashboard/carts",
    icon: ShoppingCart,
  },
];

const footerNavItems: NavItem[] = [
  {
    title: "Configurar",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={"/dashboard"} prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
