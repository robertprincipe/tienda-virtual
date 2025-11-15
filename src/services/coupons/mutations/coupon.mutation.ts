"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@pheralb/toast";

import {
  createCoupon,
  deleteCoupon,
  updateCoupon,
} from "../actions/coupon.actions";
import type { CouponFormValues } from "@/schemas/coupon.schema";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado";
};

export const useCreateCoupon = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (values: CouponFormValues) => await createCoupon(values),
    onSuccess: (data) => {
      toast.success({
        text: data.message,
      });
      router.push("/dashboard/coupons");
      router.refresh();
    },
    onError: (error) => {
      toast.error({
        text: getErrorMessage(error),
      });
    },
  });
};

export const useUpdateCoupon = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (values: CouponFormValues & { id: number }) =>
      await updateCoupon(values),
    onSuccess: (data) => {
      toast.success({
        text: data.message,
      });
      router.push("/dashboard/coupons");
      router.refresh();
    },
    onError: (error) => {
      toast.error({
        text: getErrorMessage(error),
      });
    },
  });
};

export const useDeleteCoupon = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (id: number) => await deleteCoupon(id),
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
