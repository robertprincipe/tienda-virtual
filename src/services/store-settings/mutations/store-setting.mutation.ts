"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@pheralb/toast";

import { updateStoreSettings } from "../actions/store-setting.actions";
import type { StoreSettingsFormValues } from "@/schemas/store-settings.schema";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Ocurrió un error inesperado";

export const useUpdateStoreSettings = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (values: StoreSettingsFormValues) =>
      await updateStoreSettings(values),
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
