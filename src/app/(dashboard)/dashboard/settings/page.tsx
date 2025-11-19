import { getStoreSettings } from "@/services/store-settings/actions/store-setting.actions";
import { Metadata } from "next";

import SettingsPage from "./page.client";

export const metadata: Metadata = {
  title: "Configuración",
  description:
    "Configura los ajustes generales de tu tienda. Personaliza información de contacto, políticas de envío y parámetros del negocio.",
};

const Page = async () => {
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto w-full max-w-5xl">
      <SettingsPage settings={settings} />
    </div>
  );
};

export default Page;
