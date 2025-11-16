import { getRoles } from "@/services/users/actions/admin-user.actions";

import CreateUserPage from "./page.client";

const Page = async () => {
  const roles = await getRoles();
  return <CreateUserPage roles={roles} />;
};

export default Page;
