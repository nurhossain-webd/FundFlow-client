"use client";

import { createAuthClient } from "better-auth/react";

const appURL = process.env.NEXT_PUBLIC_APP_URL;

if (!appURL) {
  throw new Error("NEXT_PUBLIC_APP_URL is required");
}

export const authClient = createAuthClient({
  baseURL: appURL,
});

export const { getSession, signIn, signOut, signUp, useSession } = authClient;
