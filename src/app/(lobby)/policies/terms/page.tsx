import { getStorePolicies } from "@/services/store-settings/actions/public-settings.actions";
import PolicyPageContent from "../policy-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Lee nuestros términos y condiciones de uso. Conoce las reglas y compromisos entre nuestra tienda y nuestros clientes.",
};

const Page = async () => {
  const settings = await getStorePolicies();

  return (
    <PolicyPageContent
      title="Términos y Condiciones"
      description="Las reglas de uso y compromisos entre nuestra tienda y los clientes."
      content={settings.termsHtml}
    />
  );
};

export default Page;
