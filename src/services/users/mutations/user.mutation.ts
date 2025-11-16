"use client";

import { updateUser } from "@/services/users/actions/user.actions";
import type { UpdateUserInput } from "@/schemas/user.schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@pheralb/toast";

interface UseUpdateUserOptions {
  userId?: number;
}

export const useUpdateUser = (options?: UseUpdateUserOptions) => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: UpdateUserInput) => {
      return await updateUser(options?.userId, input);
    },
    onSuccess: () => {
      toast.success({
        text: "Perfil actualizado correctamente",
      });
      router.push("/account");
      router.refresh();
    },
    onError: (error) => {
      toast.error({
        text:
          error instanceof Error
            ? error.message
            : "Error al actualizar el perfil",
      });
    },
  });
};
