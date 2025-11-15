import AppLayoutTemplate from "@/layouts/app/app-sidebar-layout";

import { type ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children, ...props }: AppLayoutProps) => (
  <AppLayoutTemplate {...props}>{children}</AppLayoutTemplate>
);

export default AppLayout;
