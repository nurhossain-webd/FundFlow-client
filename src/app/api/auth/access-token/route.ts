import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
};

export async function POST() {
  const requestHeaders = await headers();
  const requestOrigin = requestHeaders.get("origin");
  const configuredOrigin = new URL(process.env.NEXT_PUBLIC_APP_URL as string)
    .origin;

  if (requestOrigin && requestOrigin !== configuredOrigin) {
    return NextResponse.json(
      { success: false, message: "Origin not allowed" },
      { status: 403, headers: noStoreHeaders },
    );
  }

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401, headers: noStoreHeaders },
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        accessToken: session.session.token,
      },
    },
    { status: 200, headers: noStoreHeaders },
  );
}
