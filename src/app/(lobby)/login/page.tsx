import { getCurrentUser } from "@/services/auth/actions/auth.actions";
import { redirect } from "next/navigation";
import LoginPage from "./page.client";

const Page = async () => {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LoginPage />;
};

export default Page;
