import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { ImageUploadError, uploadImageToImgBB } from "@/lib/imgbb";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const errorResponse = (message: string, status: number) =>
  NextResponse.json({ success: false, message }, { status });

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return errorResponse("Authentication required", 401);
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

  try {
    const imageURL = await uploadImageToImgBB(
      image,
      `fundflow-profile-${session.user.id}`,
    );

    return NextResponse.json({
      success: true,
      data: {
        imageURL,
      },
    });
  } catch (error) {
    if (error instanceof ImageUploadError) {
      return errorResponse(error.message, error.statusCode);
    }

    return errorResponse("Profile image upload failed", 502);
  }
}
