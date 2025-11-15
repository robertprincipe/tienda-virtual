import { useMutation } from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../actions/category.actions";
import { useRouter } from "next/navigation";
import { toast } from "@pheralb/toast";

export const useCreateCategory = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: (data) => {
      toast.success({
        text: data.message,
      });
      router.push("/dashboard/categories");
    },
    onError: (e) => {
      toast.error({
        text: e.message,
      });
    },
  });
};

export const useUpdateCategory = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: updateCategory,
    onSuccess: (data) => {
      toast.success({
        text: data.message,
      });
      router.push("/dashboard/categories");
    },
    onError: (e) => {
      toast.error({
        text: e.message,
      });
    },
  });
};

export const useDeleteCategory = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (data) => {
      toast.success({
        text: data.message,
      });
      router.refresh();
    },
    onError: (e) => {
      toast.error({
        text: e.message,
      });
    },
  });
};
