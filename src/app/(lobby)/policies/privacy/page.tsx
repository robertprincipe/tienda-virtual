import { getStorePolicies } from "@/services/store-settings/actions/public-settings.actions";
import PolicyPageContent from "../policy-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Conoce cómo protegemos y tratamos los datos personales de nuestros clientes. Tu privacidad es importante para nosotros.",
};

const Page = async () => {
  const settings = await getStorePolicies();

  return (
    <PolicyPageContent
      title="Política de Privacidad"
      description="Conoce cómo protegemos y tratamos los datos personales de nuestros clientes."
      content={settings.privacyPolicyHtml}
    />
  );
};

export default Page;
