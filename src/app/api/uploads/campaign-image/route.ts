import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { ImageUploadError, uploadImageToImgBB } from "@/lib/imgbb";
import { hasTrustedBrowserOrigin } from "@/lib/server-request-security";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const profileResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    profile: z.object({
      role: z.enum(["supporter", "creator", "admin"]),
    }),
  }),
});

const errorResponse = (message: string, status: number) =>
  NextResponse.json({ success: false, message }, { status });

export async function POST(request: Request) {
  if (!hasTrustedBrowserOrigin(request)) {
    return errorResponse("Origin not allowed", 403);
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return errorResponse("Authentication required", 401);
  }

  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  if (!apiURL) {
    return errorResponse("FundFlow API is not configured", 503);
  }

  let profileResponse: Response;

  try {
    profileResponse = await fetch(`${apiURL}/onboarding/profile`, {
      headers: {
        Authorization: `Bearer ${session.session.token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    return errorResponse("Unable to verify creator access", 503);
  }

  if (!profileResponse.ok) {
    return errorResponse("Unable to verify creator access", 403);
  }

  const profileResult = profileResponseSchema.safeParse(
    await profileResponse.json(),
  );

  if (
    !profileResult.success ||
    profileResult.data.data.profile.role !== "creator"
  ) {
    return errorResponse("Creator access required", 403);
  }

  const body = await request.formData();
  const image = body.get("image");

  if (!(image instanceof File)) {
    return errorResponse("Choose a campaign image", 400);
  }

  if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
    return errorResponse("Use a JPG, PNG, or WebP image", 400);
  }

  if (image.size === 0 || image.size > MAX_IMAGE_SIZE) {
    return errorResponse("Campaign image must be 8 MB or smaller", 400);
  }

  try {
    const imageURL = await uploadImageToImgBB(
      image,
      `fundflow-campaign-${session.user.id}-${Date.now()}`,
    );

    return NextResponse.json({
      success: true,
      data: { imageURL },
    });
  } catch (error) {
    if (error instanceof ImageUploadError) {
      return errorResponse(error.message, error.statusCode);
    }

    return errorResponse("Campaign image upload failed", 502);
  }
}
