"use client";

import { useLayoutEffect, useState, useSyncExternalStore } from "react";
import { ACCESS_TOKEN_CHANGED_EVENT, getAccessToken } from "@/lib/auth";

/**
 * True after the first client pass — runs in useLayoutEffect so we avoid an extra painted frame
 * before treating `useAccessToken() === null` as “logged out”.
 */
export function useHydrated(): boolean {
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => setReady(true), []);
  return ready;
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const run = () => onStoreChange();
  window.addEventListener(ACCESS_TOKEN_CHANGED_EVENT, run);
  window.addEventListener("storage", run);
  return () => {
    window.removeEventListener(ACCESS_TOKEN_CHANGED_EVENT, run);
    window.removeEventListener("storage", run);
  };
}

function getServerSnapshot() {
  return null as string | null;
}

function getSnapshot() {
  return getAccessToken();
}

/**
 * Reads the JWT from localStorage in a hydration-safe way (matches server snapshot, then updates).
 * Re-renders when {@link import("./auth").setAccessToken} / clear runs (same tab) or `storage` fires (other tabs).
 */
export function useAccessToken(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
