import { SiteHeader } from "./_layout/site-header";

import { SiteFooter } from "./_layout/site-footer";
import { ChooseOptionsSheet } from "./_components/choose-options-sheet";
import { PropsWithChildren } from "react";
import { PurchaseAlert } from "./_components/purchase-alert";
import { WhatsAppButton } from "./_components/whatsapp-button";

export default function LobbyLayout({ children }: PropsWithChildren) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      <PurchaseAlert />

      <WhatsAppButton />

      <ChooseOptionsSheet />
    </>
  );
}
