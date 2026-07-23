import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const imgBBResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    url: z.url(),
  }),
});

const errorResponse = (message: string, status: number) =>
  NextResponse.json({ success: false, message }, { status });

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return errorResponse("Authentication required", 401);
  }

  const apiKey = process.env.IMGBB_API_KEY;

  if (!apiKey) {
    return errorResponse("Profile image service is not configured", 503);
  }

  const requestBody = await request.formData();
  const image = requestBody.get("image");

  if (!(image instanceof File)) {
    return errorResponse("Choose a profile image", 400);
  }

  if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
    return errorResponse("Use a JPG, PNG, or WebP image", 400);
  }

  if (image.size === 0 || image.size > MAX_IMAGE_SIZE) {
    return errorResponse("Profile image must be 5 MB or smaller", 400);
  }

  const uploadBody = new FormData();
  uploadBody.append("image", image);
  uploadBody.append("name", `fundflow-profile-${session.user.id}`);

  let uploadResponse: Response;

  try {
    uploadResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: uploadBody,
        signal: AbortSignal.timeout(20_000),
      },
    );
  } catch {
    return errorResponse("Profile image service is unavailable", 503);
  }

  if (!uploadResponse.ok) {
    return errorResponse("Profile image upload failed", 502);
  }

  const result = imgBBResponseSchema.safeParse(await uploadResponse.json());

  if (!result.success) {
    return errorResponse(
      "Profile image service returned an invalid response",
      502,
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      imageURL: result.data.data.url,
    },
  });
}
