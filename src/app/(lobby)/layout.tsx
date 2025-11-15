import { SiteHeader } from "./_layout/site-header";

import { SiteFooter } from "./_layout/site-footer";

import { PropsWithChildren } from "react";

import { WhatsAppButton } from "./_components/whatsapp-button";

export default function LobbyLayout({ children }: PropsWithChildren) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />

      <WhatsAppButton />
    </>
  );
}
