import { getRoles, getUser } from "@/services/users/actions/admin-user.actions";
import { notFound } from "next/navigation";
import { Metadata } from "next";

import EditUserPage from "./page.client";

export const metadata: Metadata = {
  title: "Editar Usuario",
  description:
    "Actualiza la información de un usuario. Modifica datos personales, cambia roles y gestiona permisos de acceso.",
};

type PageProps = {
  params: Promise<{ userId: string }>;
};

const Page = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const userId = Number(resolvedParams.userId);

  const [user, roles] = await Promise.all([getUser(userId), getRoles()]);

  if (!user) {
    notFound();
  }

  return <EditUserPage user={user} roles={roles} />;
};

export default Page;
