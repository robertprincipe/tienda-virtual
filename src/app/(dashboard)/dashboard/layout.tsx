import type { Metadata } from "next";

import { AppContent } from "@/components/app-content";
import { AppShell } from "@/components/app-shell";
import { AppSidebar } from "@/components/app-sidebar";
import { AppSidebarHeader } from "@/components/app-sidebar-header";
import { getCurrentUser } from "@/services/auth/actions/auth.actions";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Panel de Administración",
  description:
    "Gestiona tu tienda en línea desde el panel de administración. Administra productos, pedidos, usuarios y más para mantener tu negocio en funcionamiento.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell variant="sidebar">
      <AppSidebar user={user} />
      <AppContent variant="sidebar" className="overflow-x-hidden">
        <AppSidebarHeader />
        {children}
      </AppContent>
    </AppShell>
  );
}
