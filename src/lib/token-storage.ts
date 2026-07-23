const API_ACCESS_TOKEN_KEY = "fundflow_api_access_token";

const canUseStorage = (): boolean => typeof window !== "undefined";

export const getApiAccessToken = (): string | null => {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(API_ACCESS_TOKEN_KEY);
};

export const storeApiAccessToken = (token: string): void => {
  if (canUseStorage() && token.trim()) {
    window.localStorage.setItem(API_ACCESS_TOKEN_KEY, token);
  }
};

export const clearApiAccessToken = (): void => {
  if (canUseStorage()) {
    window.localStorage.removeItem(API_ACCESS_TOKEN_KEY);
  }
};
