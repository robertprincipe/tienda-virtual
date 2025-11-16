import { getStorePolicies } from "@/services/store-settings/actions/public-settings.actions";
import PolicyPageContent from "../policy-page";

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
