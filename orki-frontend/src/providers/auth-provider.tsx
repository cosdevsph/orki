"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import type { SessionUser } from "@/shared/types/session";
import { getSession } from "@/shared/api/auth";
import { env } from "@/shared/config/env";

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  /** Update the in-memory user after a login or profile patch. */
  setUser: (user: SessionUser | null) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  setUser: () => {},
});

export function useAuthContext(): AuthContextValue {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = useCallback((u: SessionUser | null) => setUserState(u), []);

  useEffect(() => {
    // 1. Prime the CSRF cookie so subsequent mutations can include X-CSRFToken.
    // 2. Then check whether a valid server session already exists.
    fetch(`${env.NEXT_PUBLIC_API_URL}csrf/`, { credentials: "include" })
      .catch(() => {})          // Non-fatal — best effort
      .finally(() => {
        getSession()
          .then((data) => setUserState(data.user))
          .catch(() => setUserState(null))
          .finally(() => setLoading(false));
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

