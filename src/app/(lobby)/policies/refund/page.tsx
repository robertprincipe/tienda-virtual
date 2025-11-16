import { getStorePolicies } from "@/services/store-settings/actions/public-settings.actions";
import PolicyPageContent from "../policy-page";

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
