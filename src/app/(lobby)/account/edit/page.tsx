import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import AccountEditClient from "./page.client";
import { getCurrentUser } from "@/services/users/actions/user.actions";

export default async function AccountEditPage() {
  const session = await getSession();

  if (!session.user) {
    redirect("/login");
  }

  // Get full user data
  const user = await getCurrentUser();

  return <AccountEditClient user={user} />;
}
