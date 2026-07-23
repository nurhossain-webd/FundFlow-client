import "server-only";

import { z } from "zod";

const imgBBResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    url: z.url(),
  }),
});

export class ImageUploadError extends Error {
  public readonly statusCode: number;

  public constructor(statusCode: number, message: string) {
    super(message);
    this.name = "ImageUploadError";
    this.statusCode = statusCode;
  }
}

export const uploadImageToImgBB = async (
  image: File,
  name: string,
): Promise<string> => {
  const apiKey = process.env.IMGBB_API_KEY;

  if (!apiKey) {
    throw new ImageUploadError(503, "Image service is not configured");
  }

  const uploadBody = new FormData();
  uploadBody.append("image", image);
  uploadBody.append("name", name);

  let response: Response;

  try {
    response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: uploadBody,
        signal: AbortSignal.timeout(20_000),
      },
    );
  } catch {
    throw new ImageUploadError(503, "Image service is unavailable");
  }

  if (!response.ok) {
    throw new ImageUploadError(502, "Image upload failed");
  }

  const result = imgBBResponseSchema.safeParse(await response.json());

  if (!result.success) {
    throw new ImageUploadError(
      502,
      "Image service returned an invalid response",
    );
  }

  return result.data.data.url;
};
