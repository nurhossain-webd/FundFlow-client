const API_ACCESS_TOKEN_KEY = "fundflow_api_access_token";

const canUseStorage = (): boolean => typeof window !== "undefined";
const isValidStoredToken = (token: string): boolean =>
  token.length >= 16 && token.length <= 4_096 && /^[\x21-\x7E]+$/.test(token);

export const getApiAccessToken = (): string | null => {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const token = window.localStorage.getItem(API_ACCESS_TOKEN_KEY);
    if (!token || !isValidStoredToken(token)) {
      clearApiAccessToken();
      return null;
    }
    return token;
  } catch {
    return null;
  }
};

export const storeApiAccessToken = (token: string): void => {
  if (canUseStorage() && isValidStoredToken(token)) {
    try {
      window.localStorage.setItem(API_ACCESS_TOKEN_KEY, token);
    } catch {
      // Storage may be unavailable in privacy-restricted browser contexts.
    }
  }
};

export const clearApiAccessToken = (): void => {
  if (canUseStorage()) {
    try {
      window.localStorage.removeItem(API_ACCESS_TOKEN_KEY);
    } catch {
      // The token cannot be persisted when browser storage is unavailable.
    }
  }
};
