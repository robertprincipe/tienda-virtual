import { paginatedUsersSchema } from "@/schemas/admin-user.schema";
import { getUsersPaginated } from "@/services/users/actions/admin-user.actions";
import { type SearchParams } from "@/types/params";

import UsersIndex from "./page.client";

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
