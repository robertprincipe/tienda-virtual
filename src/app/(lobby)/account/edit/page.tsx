import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import AccountEditClient from "./page.client";
import { getCurrentUser } from "@/services/users/actions/user.actions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editar Perfil",
  description:
    "Actualiza tu información personal. Modifica tus datos de contacto y preferencias de cuenta.",
};

export default async function AccountEditPage() {
  const session = await getSession();

  if (!session.user) {
    redirect("/login");
  }

  // Get full user data
  const user = await getCurrentUser();

  return <AccountEditClient user={user} />;
}
