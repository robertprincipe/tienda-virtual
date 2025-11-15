import { imageKitDelete, imageKitStore } from "@/lib/imagekit";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const data = await req.formData();
  const files: File[] | null = data.getAll("files") as unknown as File[];

  try {
    const res = await imageKitStore(files);

    return NextResponse.json(
      res.map((file) => ({
        id: file.fileId,
        name: file.name,
        url: file.url,
      }))
    );
  } catch (error) {
    let message = "Unknown error";

    if (error instanceof Error) message = error.message;

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
};

export const DELETE = async (req: NextRequest) => {
  const url = new URL(req.url);

  const fileIds = url.searchParams.getAll("file_ids");

  if (fileIds) {
    await imageKitDelete(fileIds);
  }

  return NextResponse.json({
    message: "file deleted",
  });
};
