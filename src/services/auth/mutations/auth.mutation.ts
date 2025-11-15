"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@pheralb/toast";

import { loginUser, logoutUser, registerUser } from "../actions/auth.actions";
import type { LoginUserInput, RegisterUserInput } from "@/schemas/auth.schema";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado";
};

export const useRegisterMutation = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (values: RegisterUserInput) => await registerUser(values),
    onSuccess: (data) => {
      toast.success({
        text: data.message,
      });
      router.replace("/dashboard");
      router.refresh();
    },
    onError: (error) => {
      toast.error({
        text: getErrorMessage(error),
      });
    },
  });
};

export const useLoginMutation = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (values: LoginUserInput) => await loginUser(values),
    onSuccess: (data) => {
      toast.success({
        text: data.message,
      });
      router.replace("/dashboard");
      router.refresh();
    },
    onError: (error) => {
      toast.error({
        text: getErrorMessage(error),
      });
    },
  });
};

export const useLogoutMutation = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: (data) => {
      toast.success({
        text: data.message,
      });
      router.replace("/login");
      router.refresh();
    },
    onError: (error) => {
      toast.error({
        text: getErrorMessage(error),
      });
    },
  });
};
