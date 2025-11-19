import { getCurrentUser } from "@/services/auth/actions/auth.actions";
import { redirect } from "next/navigation";
import RegisterPage from "./page.client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Cuenta",
  description:
    "Regístrate para disfrutar de una experiencia de compra personalizada. Crea tu cuenta y accede a beneficios exclusivos.",
};

const Page = async () => {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return <RegisterPage />;
};

export default Page;
