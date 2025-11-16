import { getRoles, getUser } from "@/services/users/actions/admin-user.actions";
import { notFound } from "next/navigation";

import EditUserPage from "./page.client";

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
