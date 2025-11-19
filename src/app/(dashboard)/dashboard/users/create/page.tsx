import { getRoles } from "@/services/users/actions/admin-user.actions";
import { Metadata } from "next";

import CreateUserPage from "./page.client";

export const metadata: Metadata = {
  title: "Crear Usuario",
  description:
    "Registra un nuevo usuario en el sistema. Asigna roles, configura permisos y establece el acceso al dashboard.",
};

const Page = async () => {
  const roles = await getRoles();
  return <CreateUserPage roles={roles} />;
};

export default Page;
