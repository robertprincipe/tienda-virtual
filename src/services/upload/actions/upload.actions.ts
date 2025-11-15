import { imageKitStore } from "@/lib/imagekit";

export const uploadFileAction = async (files: File[]) => {
  const res = await imageKitStore(files);
  return {
    message: `Imagenes subidas`,
    result: res.map((file) => ({
      id: file.fileId,
      name: file.name,
      url: file.url,
    })),
  };
};
