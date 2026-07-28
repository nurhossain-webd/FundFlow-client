import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { getApiBaseURL } from "@/lib/api-url";
import { hasTrustedBrowserOrigin } from "@/lib/server-request-security";

const demoRoleSchema = z.object({
  role: z.enum(["supporter", "admin"]),
});

const demoCredentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(128),
});

const DEFAULT_DEMO_CREDENTIALS = {
  supporter: {
    email: "demo.supporter@fundflow.local",
    password: "DemoSupporter123!",
  },
  admin: {
    email: "demo.admin@fundflow.local",
    password: "DemoAdmin123!",
  },
} as const;

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
};

const provisionDemoProfile = async (
  signInResponse: Response,
  role: "supporter" | "admin",
): Promise<void> => {
  const apiURL = getApiBaseURL(process.env.NEXT_PUBLIC_API_URL);

  const signInResult: unknown = await signInResponse.clone().json();
  const token =
    signInResult &&
    typeof signInResult === "object" &&
    "token" in signInResult &&
    typeof signInResult.token === "string"
      ? signInResult.token
      : undefined;

  if (!token) {
    throw new Error("Demo session could not be created");
  }

  let response: Response;

  try {
    response = await fetch(
      new URL("onboarding/demo-profile", `${apiURL.replace(/\/+$/, "")}/`),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
        signal: AbortSignal.timeout(10_000),
      },
    );
  } catch {
    throw new Error(
      "FundFlow API is unavailable. Start the server and try again.",
    );
  }

  if (!response.ok) {
    const result: unknown = await response.json().catch(() => null);
    const message =
      result &&
      typeof result === "object" &&
      "message" in result &&
      typeof result.message === "string"
        ? result.message
        : "Unable to create the demo platform profile";

    throw new Error(message);
  }
};

const getDemoCredentials = (role: "supporter" | "admin") => {
  const configuredCredentials =
    role === "supporter"
      ? {
          email: process.env.DEMO_SUPPORTER_EMAIL?.trim(),
          password: process.env.DEMO_SUPPORTER_PASSWORD?.trim(),
        }
      : {
          email: process.env.DEMO_ADMIN_EMAIL?.trim(),
          password: process.env.DEMO_ADMIN_PASSWORD?.trim(),
        };

  const fallbackCredentials = DEFAULT_DEMO_CREDENTIALS[role];

  return demoCredentialsSchema.safeParse({
    email: configuredCredentials.email || fallbackCredentials.email,
    password: configuredCredentials.password || fallbackCredentials.password,
  });
};

const authenticateDemoAccount = async (
  request: Request,
  credentials: { email: string; password: string },
  role: "supporter" | "admin",
) => {
  const displayName =
    role === "admin" ? "FundFlow Demo Admin" : "FundFlow Demo Supporter";

  const existingUser = await auth.api.signInEmail({
    headers: request.headers,
    body: {
      email: credentials.email,
      password: credentials.password,
      rememberMe: true,
    },
    asResponse: true,
  });

  if (existingUser.status === 200) {
    await provisionDemoProfile(existingUser, role);
    return existingUser;
  }

  const signUpResponse = await auth.api.signUpEmail({
    headers: request.headers,
    body: {
      email: credentials.email,
      password: credentials.password,
      name: displayName,
    },
    asResponse: true,
  });

  if (signUpResponse.status !== 200) {
    throw new Error("Unable to create demo user");
  }

  const followUpSignInResponse = await auth.api.signInEmail({
    headers: request.headers,
    body: {
      email: credentials.email,
      password: credentials.password,
      rememberMe: true,
    },
    asResponse: true,
  });

  if (followUpSignInResponse.status !== 200) {
    throw new Error("Unable to sign in demo user");
  }

  await provisionDemoProfile(followUpSignInResponse, role);
  return followUpSignInResponse;
};

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
    return await authenticateDemoAccount(
      request,
      credentialsResult.data,
      roleResult.data.role,
    );
  } catch (error) {
    console.error("Demo login failed", error);

    const message =
      error instanceof Error && error.message
        ? error.message
        : "Demo login failed. Please try again.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 401, headers: noStoreHeaders },
    );
  }
}
