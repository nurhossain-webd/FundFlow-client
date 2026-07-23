"use client";

import { createAuthClient } from "better-auth/react";

import {
  clearApiAccessToken,
  getApiAccessToken,
  storeApiAccessToken,
} from "./token-storage";

const appURL = process.env.NEXT_PUBLIC_APP_URL;

if (!appURL) {
  throw new Error("NEXT_PUBLIC_APP_URL is required");
}

export const authClient = createAuthClient({
  baseURL: appURL,
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => getApiAccessToken() ?? "",
    },
    onSuccess: (context) => {
      const bearerToken = context.response.headers.get("set-auth-token");

      if (bearerToken) {
        storeApiAccessToken(bearerToken);
      }
    },
  },
});

export const { getSession, signIn, signUp, useSession } = authClient;

export const signOut: typeof authClient.signOut = async (options) => {
  try {
    return await authClient.signOut(options);
  } finally {
    clearApiAccessToken();
  }
};
