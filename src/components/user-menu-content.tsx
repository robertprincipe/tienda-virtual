"use client";

import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserInfo } from "@/components/user-info";

import type { SessionUser } from "@/types/auth";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useLogoutMutation } from "@/services/auth/mutations/auth.mutation";

interface UserMenuContentProps {
  user: SessionUser;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
  const { mutate, isPending } = useLogoutMutation();

  return (
    <>
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <UserInfo user={user} showEmail={true} />
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
          <Link
            className="block w-full"
            href={"/dashboard/settings"}
            as="button"
            prefetch
            // onClick={cleanup}
          >
            <Settings className="mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onSelect={(event) => {
          event.preventDefault();
          mutate();
        }}
        disabled={isPending}
      >
        <LogOut className="mr-2" />
        {isPending ? "Cerrando sesión..." : "Cerrar sesión"}
      </DropdownMenuItem>
    </>
  );
}
