"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserInfo } from "@/components/user-info";
import { useIsMobile } from "@/hooks/use-mobile";
import type { SessionUser } from "@/types/auth";
import { ChevronsUpDown } from "lucide-react";
import { UserMenuContent } from "@/components/user-menu-content";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NavUserProps {
  user?: SessionUser | null;
}

export function NavUser({ user }: NavUserProps) {
  const { state } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent"
            >
              {user ? (
                <UserInfo user={user} />
              ) : (
                <span className="flex-1 text-left text-sm font-medium">
                  Invitado
                </span>
              )}
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="end"
            side={
              isMobile ? "bottom" : state === "collapsed" ? "left" : "bottom"
            }
          >
            {user ? (
              <UserMenuContent user={user} />
            ) : (
              <div className="flex flex-col gap-2 p-2 text-sm">
                <p className="text-muted-foreground">
                  Inicia sesión para administrar tu cuenta.
                </p>
                <Button asChild size="sm">
                  <Link href="/login">Iniciar sesión</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/register">Crear cuenta</Link>
                </Button>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
