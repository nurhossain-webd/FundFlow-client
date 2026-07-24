export type DemoLoginRole = "supporter" | "admin";

export const signInDemoAccount = async (role: DemoLoginRole): Promise<void> => {
  const response = await fetch("/api/auth/demo-login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  });

  if (response.ok) {
    return;
  }

  const error: unknown = await response.json().catch(() => null);
  let message = "Unable to sign in to this demo account";

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    message = error.message;
  }

  throw new Error(message);
};
