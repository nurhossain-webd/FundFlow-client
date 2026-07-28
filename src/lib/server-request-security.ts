import "server-only";

const configuredAppURL = process.env.NEXT_PUBLIC_APP_URL;

if (!configuredAppURL) {
  throw new Error("NEXT_PUBLIC_APP_URL is required");
}

const trustedOrigin = new URL(configuredAppURL).origin;
const trustedHost = new URL(configuredAppURL).host;

export const hasTrustedBrowserOrigin = (request: Request): boolean => {
  const requestOrigin = request.headers.get("origin");

  if (requestOrigin) {
    return requestOrigin === trustedOrigin;
  }

  const requestHost = request.headers.get("host");

  if (requestHost) {
    return requestHost === trustedHost;
  }

  return true;
};
