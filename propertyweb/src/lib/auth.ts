const KEY = "pw_access_token";

/** Dispatched when the access token is set or cleared (same-tab listeners). */
export const ACCESS_TOKEN_CHANGED_EVENT = "pw-access-token-changed";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, token);
  window.dispatchEvent(new CustomEvent(ACCESS_TOKEN_CHANGED_EVENT));
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(ACCESS_TOKEN_CHANGED_EVENT));
}

/** Clears the session and sends the user to the public home page. Use this for every Logout control. */
export function logout() {
  if (typeof window === "undefined") return;
  clearAccessToken();
  window.location.assign("/");
}

