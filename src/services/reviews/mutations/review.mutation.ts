"use client";

import {
  createReview as createReviewPublic,
  createReviewAdmin,
  deleteReviewAdmin,
  updateReviewAdmin,
} from "@/services/reviews/actions/review.actions";
import type { CreateReviewInput } from "@/schemas/review.schema";
import type { ReviewFormValues } from "@/schemas/product-review.schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@pheralb/toast";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Ocurrió un error inesperado";

export const useCreateReview = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: CreateReviewInput) => {
      return await createReviewPublic(input);
    },
    onSuccess: () => {
      toast.success({
        text: "Reseña publicada correctamente.",
      });
      router.refresh();
    },
    onError: (error) => {
      toast.error({
        text: error instanceof Error ? error.message : "Error al enviar la reseña",
      });
    },
  });
};

export const useCreateReviewAdmin = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (values: ReviewFormValues) =>
      await createReviewAdmin(values),
    onSuccess: (data) => {
      toast.success({
        text: data.message,
      });
      router.push("/dashboard/reviews");
      router.refresh();
    },
    onError: (error) => {
      toast.error({
        text: getErrorMessage(error),
      });
    },
  });
};

export const useUpdateReview = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (values: ReviewFormValues & { id: number }) =>
      await updateReviewAdmin(values),
    onSuccess: (data) => {
      toast.success({
        text: data.message,
      });
      router.push("/dashboard/reviews");
      router.refresh();
    },
    onError: (error) => {
      toast.error({
        text: getErrorMessage(error),
      });
    },
  });
};

export const useDeleteReview = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (id: number) => await deleteReviewAdmin(id),
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
