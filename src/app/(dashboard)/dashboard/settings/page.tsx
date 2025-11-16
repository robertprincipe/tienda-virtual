import { getStoreSettings } from "@/services/store-settings/actions/store-setting.actions";

import SettingsPage from "./page.client";

const Page = async () => {
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto w-full max-w-5xl">
      <SettingsPage settings={settings} />
    </div>
  );
};

export default Page;
