/**
 * Admin dev-bypass is permanently disabled.
 *
 * The backend no longer supports APP_SECURITY_DEV_ADMIN_OPEN, and the product
 * policy is now: every role must log in with real credentials. These helpers
 * are kept only so the many admin pages that reference them keep compiling —
 * they always behave as "auth required".
 */

export function isAdminDevBypass(): boolean {
  return false;
}

/** Admin fetches/mutations require a real access token, always. */
export function adminDashboardApiEnabled(accessToken: string | null): boolean {
  return Boolean(accessToken?.trim());
}
