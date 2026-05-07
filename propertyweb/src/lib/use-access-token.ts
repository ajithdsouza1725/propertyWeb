"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { AUTH_CHANGED_EVENT } from "@/lib/auth";

export type AuthUser = {
  id?: number;
  email?: string;
  role: string;
  [key: string]: unknown;
};

export type AuthState = {
  /** null = not logged in, object = logged in */
  user: AuthUser | null;
  /** true while initial /api/auth/me fetch is in flight */
  loading: boolean;
};

/**
 * True after first client render. Use to guard hydration-sensitive
 * UI before treating auth state as authoritative.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useLayoutEffect(() => setHydrated(true), []);
  return hydrated;
}

/**
 * Returns current auth state by calling GET /api/auth/me.
 * Re-fetches when AUTH_CHANGED_EVENT fires (login/logout).
 *
 * States:
 *  { user: null, loading: true }  — initial fetch in flight
 *  { user: null, loading: false } — not authenticated
 *  { user: {...}, loading: false } — authenticated
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "same-origin" });
      if (res.ok) {
        const user = await res.json();
        setState({ user, loading: false });
      } else {
        setState({ user: null, loading: false });
      }
    } catch {
      setState({ user: null, loading: false });
    }
  }, []);

  useEffect(() => {
    fetchMe();

    // Re-check when auth changes (login/logout in same tab)
    const handler = () => fetchMe();
    window.addEventListener(AUTH_CHANGED_EVENT, handler);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, handler);
  }, [fetchMe]);

  return state;
}

/**
 * @deprecated Use useAuth() instead. Backwards-compat shim.
 * Returns a truthy string when authenticated, null otherwise.
 * apiFetch on client-side routes through the backend proxy
 * so the actual token value is irrelevant.
 */
export function useAccessToken(): string | null {
  const { user } = useAuth();
  return user ? "cookie" : null;
}
