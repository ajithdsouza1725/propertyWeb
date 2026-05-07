/**
 * Auth helpers — httpOnly cookie–based.
 * JWT is stored in an httpOnly cookie named "mh_token", set by
 * the Next.js /api/auth/login route. JavaScript never touches
 * the raw token; all authenticated Spring Boot calls go through
 * the /api/backend proxy which reads the cookie server-side.
 */

/** Event fired after login/logout so components re-check auth state. */
export const AUTH_CHANGED_EVENT = "mh-auth-changed";

function fireAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
  }
}

/** Call POST /api/auth/logout, clear cookie, redirect. */
export async function logout() {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // best-effort
  }
  fireAuthChanged();
  window.location.assign("/login");
}

/** Notify other components that auth state changed (e.g. after login). */
export function notifyAuthChanged() {
  fireAuthChanged();
}
