import { paginatedUsersSchema } from "@/schemas/admin-user.schema";
import { getUsersPaginated } from "@/services/users/actions/admin-user.actions";
import { type SearchParams } from "@/types/params";
import { Metadata } from "next";

import UsersIndex from "./page.client";

export const metadata: Metadata = {
  title: "Usuarios",
  description:
    "Gestiona los usuarios y permisos del sistema. Administra roles, actualiza información de usuarios y controla el acceso al dashboard.",
};

type UsersPageProps = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: UsersPageProps) => {
  const resolvedSearchParams = await searchParams;
  const input = paginatedUsersSchema.parse(resolvedSearchParams);

  const usersPromise = getUsersPaginated(input);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <UsersIndex usersPromise={usersPromise} />
    </div>
  );
};

export default Page;
