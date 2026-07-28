import "server-only";

import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { betterAuth } from "better-auth/minimal";
import { bearer } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { z } from "zod";

const serverEnvironmentSchema = z.object({
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must contain at least 32 characters"),
  BETTER_AUTH_URL: z.url("BETTER_AUTH_URL must be a valid URL"),
  MONGODB_URI: z
    .string()
    .refine(
      (value) =>
        value.startsWith("mongodb://") || value.startsWith("mongodb+srv://"),
      "MONGODB_URI must be a valid MongoDB connection URI",
    ),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  NEXT_PUBLIC_APP_URL: z.url("NEXT_PUBLIC_APP_URL must be a valid URL"),
});

const parsedEnvironment = serverEnvironmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const details = parsedEnvironment.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid Better Auth environment configuration: ${details}`);
}

const authEnvironment = parsedEnvironment.data;
const isProduction = process.env.NODE_ENV === "production";

const mongoGlobal = globalThis as typeof globalThis & {
  fundFlowAuthMongoClient?: MongoClient;
};

const mongoClient =
  mongoGlobal.fundFlowAuthMongoClient ??
  new MongoClient(authEnvironment.MONGODB_URI);

const authDatabaseName = process.env.MONGODB_DB_NAME?.trim() || "fundflow";

if (!isProduction) {
  mongoGlobal.fundFlowAuthMongoClient = mongoClient;
}

const trustedOrigins = Array.from(
  new Set([
    "http://localhost:3000",
    authEnvironment.BETTER_AUTH_URL,
    authEnvironment.NEXT_PUBLIC_APP_URL,
  ]),
);

const getSafeOAuthFailure = (
  details: readonly unknown[],
): { providerError: string; status?: number } => {
  const failure = details[0];

  if (!failure || typeof failure !== "object") {
    return { providerError: "unknown" };
  }

  const status =
    "status" in failure && typeof failure.status === "number"
      ? failure.status
      : undefined;
  const response =
    "error" in failure && failure.error && typeof failure.error === "object"
      ? failure.error
      : undefined;
  const providerError =
    response &&
    "error" in response &&
    typeof response.error === "string" &&
    /^[a-z_]{1,50}$/i.test(response.error)
      ? response.error
      : "unknown";

  return { providerError, status };
};

export const auth = betterAuth({
  appName: "FundFlow",
  secret: authEnvironment.BETTER_AUTH_SECRET,
  baseURL: authEnvironment.BETTER_AUTH_URL,
  basePath: "/api/auth",
  logger: {
    level: "error",
    log: (level, message, ...details) => {
      if (message === "") {
        const failure = getSafeOAuthFailure(details);
        console.error(
          `[Better Auth] OAuth token exchange failed (provider_error=${failure.providerError}, status=${failure.status ?? "unknown"})`,
        );
        return;
      }

      // Deliberately omit provider details: they can contain authorization
      // codes, tokens, or credential-adjacent request data.
      console.error(`[Better Auth] ${level}: ${message}`);
    },
  },
  database: mongodbAdapter(mongoClient.db(authDatabaseName), {
    client: mongoClient,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  socialProviders: {
    google: {
      clientId: authEnvironment.GOOGLE_CLIENT_ID,
      clientSecret: authEnvironment.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    freshAge: 60 * 60,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
      strategy: "jwe",
    },
  },
  trustedOrigins,
  advanced: {
    useSecureCookies: isProduction,
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
    },
  },
  plugins: [
    bearer({
      requireSignature: false,
    }),
  ],
});
