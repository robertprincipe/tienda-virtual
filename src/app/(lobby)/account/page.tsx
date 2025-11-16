import { getCurrentUser } from "@/services/auth/actions/auth.actions";
import { redirect } from "next/navigation";
import AccountClient from "./page.client";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <AccountClient user={user} />;
}
