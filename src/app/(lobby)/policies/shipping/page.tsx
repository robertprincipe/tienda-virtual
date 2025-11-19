import { getStorePolicies } from "@/services/store-settings/actions/public-settings.actions";
import PolicyPageContent from "../policy-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Envíos",
  description:
    "Consulta nuestra política de envíos. Información sobre tiempos de entrega, cobertura y costos de envío.",
};

const Page = async () => {
  const settings = await getStorePolicies();

  return (
    <PolicyPageContent
      title="Política de Envíos"
      description="Información sobre tiempos, cobertura y costos de envío."
      content={settings.shippingPolicyHtml}
    />
  );
};

export default Page;
