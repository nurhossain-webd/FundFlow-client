import axios from "axios";

import {
  clearApiAccessToken,
  getApiAccessToken,
  storeApiAccessToken,
} from "./token-storage";

const apiURL = process.env.NEXT_PUBLIC_API_URL;

if (!apiURL) {
  throw new Error("NEXT_PUBLIC_API_URL is required");
}

export const apiClient = axios.create({
  baseURL: apiURL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface AccessTokenResponse {
  success: true;
  data: {
    accessToken: string;
  };
}

interface RetryableRequest {
  _authRetry?: boolean;
  headers?: Record<string, string>;
}

let tokenRequest: Promise<string | null> | undefined;

const restoreApiAccessToken = async (): Promise<string | null> => {
  if (!tokenRequest) {
    tokenRequest = fetch("/api/auth/access-token", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        const result = (await response.json()) as AccessTokenResponse;
        storeApiAccessToken(result.data.accessToken);
        return result.data.accessToken;
      })
      .catch(() => null)
      .finally(() => {
        tokenRequest = undefined;
      });
  }

  return tokenRequest;
};

apiClient.interceptors.request.use(async (config) => {
  const token = getApiAccessToken() ?? (await restoreApiAccessToken());

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const request = error.config as RetryableRequest | undefined;

    if (!request || request._authRetry) {
      clearApiAccessToken();
      return Promise.reject(error);
    }

    request._authRetry = true;
    clearApiAccessToken();
    const refreshedToken = await restoreApiAccessToken();

    if (!refreshedToken) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("fundflow:unauthorized"));
      }
      return Promise.reject(error);
    }

    request.headers = {
      ...request.headers,
      Authorization: `Bearer ${refreshedToken}`,
    };

    return apiClient.request(request);
  },
);
