"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@pheralb/toast";

import {
  createCart,
  deleteCart,
  updateCart,
} from "../actions/cart.actions";
import type { CartFormValues } from "@/schemas/cart.schema";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado";
};

export const useCreateCart = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (values: CartFormValues) => await createCart(values),
    onSuccess: (data) => {
      toast.success({
        text: data.message,
      });
      router.push("/dashboard/carts");
      router.refresh();
    },
    onError: (error) => {
      toast.error({
        text: getErrorMessage(error),
      });
    },
  });
};

export const useUpdateCart = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (values: CartFormValues & { id: number }) =>
      await updateCart(values),
    onSuccess: (data) => {
      toast.success({
        text: data.message,
      });
      router.push("/dashboard/carts");
      router.refresh();
    },
    onError: (error) => {
      toast.error({
        text: getErrorMessage(error),
      });
    },
  });
};

export const useDeleteCart = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (id: number) => await deleteCart(id),
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
