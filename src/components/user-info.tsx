import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { SessionUser } from "@/types/auth";

type UserLike = SessionUser;

export function UserInfo({
  user,
  showEmail = false,
}: {
  user: UserLike;
  showEmail?: boolean;
}) {
  return (
    <>
      <Avatar className="h-8 w-8 overflow-hidden rounded-full">
        <AvatarImage src={user.photoUrl ?? undefined} alt={user.name} />
        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
          {user.name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user.name}</span>
        {showEmail && (
          <span className="truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        )}
      </div>
    </>
  );
}
