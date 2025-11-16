"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@pheralb/toast";

import {
  createUserAdmin,
  deleteUserAdmin,
  updateUserAdmin,
} from "../actions/admin-user.actions";
import type { UserFormValues } from "@/schemas/admin-user.schema";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Ocurrió un error inesperado";

export const useCreateUser = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (values: UserFormValues) => await createUserAdmin(values),
    onSuccess: (data) => {
      toast.success({
        text: data.message,
      });
      router.push("/dashboard/users");
      router.refresh();
    },
    onError: (error) => {
      toast.error({
        text: getErrorMessage(error),
      });
    },
  });
};

export const useUpdateUser = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (values: UserFormValues & { id: number }) =>
      await updateUserAdmin(values),
    onSuccess: (data) => {
      toast.success({
        text: data.message,
      });
      router.push("/dashboard/users");
      router.refresh();
    },
    onError: (error) => {
      toast.error({
        text: getErrorMessage(error),
      });
    },
  });
};

export const useDeleteUser = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (id: number) => await deleteUserAdmin(id),
    onSuccess: (data) => {
      toast.success({
        text: data.message,
      });
      router.refresh();
    },
    onError: (error) => {
      toast.error({
        text: getErrorMessage(error),
      });
    },
  });
};
