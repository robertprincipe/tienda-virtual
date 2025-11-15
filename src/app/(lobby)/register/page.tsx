import { getCurrentUser } from "@/services/auth/actions/auth.actions";
import { redirect } from "next/navigation";
import RegisterPage from "./page.client";

const Page = async () => {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return <RegisterPage />;
};

export default Page;
