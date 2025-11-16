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
      // Los usuarios nuevos son customers (roleId = 3), van a /products
      router.replace("/products");
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

      // Redirigir según el rol del usuario
      // roleId 1 = Admin, 2 = Seller → /dashboard
      // roleId 3 = Customer → /products
      if (data.user.roleId === 1 || data.user.roleId === 2) {
        router.replace("/dashboard");
      } else {
        router.replace("/products");
      }
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
