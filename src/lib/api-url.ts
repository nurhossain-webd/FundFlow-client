export const getApiBaseURL = (configuredURL: string | undefined): string => {
  if (!configuredURL) {
    throw new Error("NEXT_PUBLIC_API_URL is required");
  }

  const url = new URL(configuredURL);
  const pathname = url.pathname.replace(/\/+$/, "");

  url.pathname = pathname === "" || pathname === "/" ? "/api/v1" : pathname;
  url.search = "";
  url.hash = "";

  return url.toString().replace(/\/+$/, "");
};
