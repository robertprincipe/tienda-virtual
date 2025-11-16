"use client";

import { createReview } from "@/services/reviews/actions/review.actions";
import type { CreateReviewInput } from "@/schemas/review.schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@pheralb/toast";

export const useCreateReview = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: CreateReviewInput) => {
      return await createReview(input);
    },
    onSuccess: () => {
      toast.success({
        text: "Reseña publicada correctamente.",
      });
      router.refresh();
    },
    onError: (error) => {
      toast.error({
        text:
          error instanceof Error ? error.message : "Error al enviar la reseña",
      });
    },
  });
};
