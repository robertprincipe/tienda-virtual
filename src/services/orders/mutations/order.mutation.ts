"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@pheralb/toast";

import {
  createOrder,
  deleteOrder,
  updateOrder,
} from "../actions/order.actions";
import type { OrderFormValues } from "@/schemas/order.schema";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado";
};

export const useCreateOrder = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (values: OrderFormValues) => await createOrder(values),
    onSuccess: (data) => {
      toast.success({
        text: data.message,
      });
      router.push("/dashboard/orders");
      router.refresh();
    },
    onError: (error) => {
      toast.error({
        text: getErrorMessage(error),
      });
    },
  });
};

export const useUpdateOrder = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (values: OrderFormValues & { id: number }) =>
      await updateOrder(values),
    onSuccess: (data) => {
      toast.success({
        text: data.message,
      });
      router.push("/dashboard/orders");
      router.refresh();
    },
    onError: (error) => {
      toast.error({
        text: getErrorMessage(error),
      });
    },
  });
};

export const useDeleteOrder = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (id: number) => await deleteOrder(id),
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
