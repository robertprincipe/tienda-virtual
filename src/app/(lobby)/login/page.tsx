import { getCurrentUser } from "@/services/auth/actions/auth.actions";
import { redirect } from "next/navigation";
import LoginPage from "./page.client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description:
    "Inicia sesión en tu cuenta para acceder a tus pedidos, lista de deseos y beneficios exclusivos.",
};

const Page = async () => {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LoginPage />;
};

export default Page;
