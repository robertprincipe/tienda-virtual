import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { type PropsWithChildren } from "react";

export const SiteLayoutTemplate = ({ children }: PropsWithChildren) => {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <Toaster />
    </>
  );
};
