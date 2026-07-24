import "server-only";

const configuredAppURL = process.env.NEXT_PUBLIC_APP_URL;

if (!configuredAppURL) {
  throw new Error("NEXT_PUBLIC_APP_URL is required");
}

const trustedOrigin = new URL(configuredAppURL).origin;

export const hasTrustedBrowserOrigin = (request: Request): boolean =>
  request.headers.get("origin") === trustedOrigin;
