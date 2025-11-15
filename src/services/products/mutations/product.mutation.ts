"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@pheralb/toast";

import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "../actions/product.actions";
import type { ProductFormValues } from "@/schemas/product.schema";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado";
};

export const useCreateProduct = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (values: ProductFormValues) => await createProduct(values),
    onSuccess: (data) => {
      toast.success({
        text: data.message,
      });
      router.push("/dashboard/products");
      router.refresh();
    },
    onError: (error) => {
      toast.error({
        text: getErrorMessage(error),
      });
    },
  });
};

export const useUpdateProduct = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (values: ProductFormValues & { id: number }) =>
      await updateProduct(values),
    onSuccess: (data) => {
      toast.success({
        text: data.message,
      });
      router.push("/dashboard/products");
      router.refresh();
    },
    onError: (error) => {
      toast.error({
        text: getErrorMessage(error),
      });
    },
  });
};

export const useDeleteProduct = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (id: number) => await deleteProduct(id),
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
