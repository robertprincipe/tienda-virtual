import { getStorePolicies } from "@/services/store-settings/actions/public-settings.actions";
import PolicyPageContent from "../policy-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Devoluciones",
  description:
    "Conoce nuestra política de devoluciones y reembolsos. Proceso, tiempos y condiciones para cambios o devoluciones.",
};

const Page = async () => {
  const settings = await getStorePolicies();

  return (
    <PolicyPageContent
      title="Política de Devoluciones"
      description="Proceso y tiempos para cambios o devoluciones."
      content={settings.refundPolicyHtml}
    />
  );
};

export default Page;
