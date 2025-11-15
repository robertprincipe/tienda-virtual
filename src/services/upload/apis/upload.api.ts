export type StoredFile = {
  id: string;
  name: string;
  url: string;
};

export const uploadFilesApi = async (files: File[]): Promise<StoredFile[]> => {
  const formData = new FormData();

  for (const file of files) {
    formData.append("files", file);
  }

  try {
    const f = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });

    const res = await f.json();

    return res;
  } catch (error) {
    console.error("Error uploading files:", error);
    return [];
  }
};
