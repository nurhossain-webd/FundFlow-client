import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { hasTrustedBrowserOrigin } from "@/lib/server-request-security";

const demoRoleSchema = z.object({
  role: z.enum(["supporter", "admin"]),
});

const demoCredentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(128),
});

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
};

const getDemoCredentials = (role: "supporter" | "admin") =>
  demoCredentialsSchema.safeParse(
    role === "supporter"
      ? {
          email: process.env.DEMO_SUPPORTER_EMAIL,
          password: process.env.DEMO_SUPPORTER_PASSWORD,
        }
      : {
          email: process.env.DEMO_ADMIN_EMAIL,
          password: process.env.DEMO_ADMIN_PASSWORD,
        },
  );

export async function POST(request: Request): Promise<Response> {
  if (!hasTrustedBrowserOrigin(request)) {
    return NextResponse.json(
      { success: false, message: "Origin not allowed" },
      { status: 403, headers: noStoreHeaders },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const roleResult = demoRoleSchema.safeParse(body);

  if (!roleResult.success) {
    return NextResponse.json(
      { success: false, message: "Invalid demo account selection" },
      { status: 400, headers: noStoreHeaders },
    );
  }

  const credentialsResult = getDemoCredentials(roleResult.data.role);

  if (!credentialsResult.success) {
    return NextResponse.json(
      {
        success: false,
        message: "This demo account is not configured",
      },
      { status: 503, headers: noStoreHeaders },
    );
  }

  try {
    return await auth.api.signInEmail({
      headers: request.headers,
      body: {
        email: credentialsResult.data.email,
        password: credentialsResult.data.password,
        rememberMe: true,
      },
      asResponse: true,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Demo login failed. Please try again.",
      },
      { status: 401, headers: noStoreHeaders },
    );
  }
}
