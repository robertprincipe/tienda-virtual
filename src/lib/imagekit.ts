import ImageKit from "imagekit";

const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export type ImageKitResponse = {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  height: number;
  width: number;
  size: number;
  filePath: string;
  fileType: string;
};

export const imageKitStore = async (files: File[]) => {
  const responses = await Promise.all(
    files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      return imageKit.upload({
        file: buffer,
        fileName: file.name,
      });
    })
  );

  return responses;
};

// delete many files
export const imageKitDelete = async (fileIds: string[]) => {
  const res = await imageKit.bulkDeleteFiles(fileIds);

  return res;
};
