"use client";

import {
  createContext,
  useContext,
  useEffect,
  type PropsWithChildren,
} from "react";

import { authClient, useSession } from "@/lib/auth-client";

type AuthSession = typeof authClient.$Infer.Session;

interface AuthContextValue {
  session: AuthSession | null;
  user: AuthSession["user"] | null;
  isPending: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const { data, error, isPending, refetch } = useSession();

  useEffect(() => {
    const handleUnauthorized = () => {
      void refetch();
    };

    window.addEventListener("fundflow:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("fundflow:unauthorized", handleUnauthorized);
    };
  }, [refetch]);

  const refreshSession = async () => {
    await refetch();
  };

  return (
    <AuthContext.Provider
      value={{
        session: data ?? null,
        user: data?.user ?? null,
        isPending,
        isAuthenticated: Boolean(data?.user),
        error: error ?? null,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
