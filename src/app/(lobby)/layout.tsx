import { SiteHeader } from "./_layout/site-header";

import { SiteFooter } from "./_layout/site-footer";

import { PropsWithChildren } from "react";

import { WhatsAppButton } from "./_components/whatsapp-button";
import { CartInitializer } from "@/components/cart/cart-initializer";
import { getFooterInfo } from "@/services/store-settings/actions/public-settings.actions";

export default async function LobbyLayout({ children }: PropsWithChildren) {
  const settings = await getFooterInfo();

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />

      <CartInitializer />

      <WhatsAppButton phone={settings.phone} logoUrl={settings.logoUrl} />
    </>
  );
}
