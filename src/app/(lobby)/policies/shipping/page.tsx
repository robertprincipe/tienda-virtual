import { getStorePolicies } from "@/services/store-settings/actions/public-settings.actions";
import PolicyPageContent from "../policy-page";

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
