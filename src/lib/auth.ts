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

export const auth = betterAuth({
  appName: "FundFlow",
  secret: authEnvironment.BETTER_AUTH_SECRET,
  baseURL: authEnvironment.BETTER_AUTH_URL,
  basePath: "/api/auth",
  database: mongodbAdapter(mongoClient.db(), {
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
