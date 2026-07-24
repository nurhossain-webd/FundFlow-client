import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { hasTrustedBrowserOrigin } from "@/lib/server-request-security";

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
};

export async function POST(request: Request) {
  const requestHeaders = await headers();

  if (!hasTrustedBrowserOrigin(request)) {
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
