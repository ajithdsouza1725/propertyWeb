export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/** Turn backend-relative paths like `/uploads/x.jpg` into a browser-usable URL. */
export function mediaAbsoluteUrl(pathOrUrl: string): string {
  const p = pathOrUrl.trim();
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  const base = API_BASE_URL.replace(/\/$/, "");
  const rel = p.startsWith("/") ? p : `/${p}`;
  return `${base}${rel}`;
}

/** Multipart upload to `POST /api/seller/uploads` (field name `file`). */
export async function apiUploadSellerFile(
  _token: string | null,
  file: File
): Promise<{ url: string }> {
  // Routes through the Next.js backend proxy — cookie handles auth.
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/backend/api/seller/uploads", {
    method: "POST",
    body: fd,
    credentials: "same-origin",
  });
  if (!res.ok) {
    let message = `Upload failed (${res.status})`;
    try {
      const payload = await res.json();
      if (payload?.message) message = String(payload.message);
    } catch {
      // ignore
    }
    throw { status: res.status, error: "Error", message } as ApiError;
  }
  return (await res.json()) as { url: string };
}

export type ApiError = {
  status: number;
  error: string;
  message: string;
  details?: unknown;
};

/** Readable message from apiFetch throws or any Error (for UI alerts). */
export function getApiErrorMessage(e: unknown, fallback = "Something went wrong"): string {
  if (e && typeof e === "object" && "message" in e) {
    const ae = e as ApiError;
    if (typeof ae.message === "string" && ae.message.trim()) {
      const raw = ae.details as { fields?: Record<string, string> } | undefined;
      const fields = raw?.fields;
      if (fields && typeof fields === "object") {
        const first = Object.values(fields).find((v) => typeof v === "string" && v.trim());
        if (first) return first;
      }
      return ae.message;
    }
  }
  if (e instanceof Error && e.message.trim()) return e.message;
  return fallback;
}

/**
 * Core fetch wrapper.
 *
 * Routing:
 *  - **Client-side, no explicit token** → routes through `/api/backend/…`
 *    (the proxy reads the httpOnly cookie and forwards as Bearer header).
 *  - **Server-side, explicit token** → calls Spring Boot directly with Bearer.
 *  - **Server-side, no token** → calls Spring Boot without auth (public endpoints).
 *  - **Full URL** → used as-is.
 */
export async function apiFetch<T>(
  path: string,
  opts?: {
    method?: string;
    token?: string | null;
    body?: unknown;
    noJson?: boolean;
  }
): Promise<T> {
  const isClient = typeof window !== "undefined";
  const hasExplicitToken =
    opts?.token != null &&
    opts.token.trim() !== "" &&
    opts.token !== "cookie"; // "cookie" sentinel = use proxy

  let url: string;

  if (path.startsWith("http")) {
    // Absolute URL — use as-is
    url = path;
  } else if (isClient && !hasExplicitToken) {
    // Client-side: route through Next.js backend proxy
    // path is like "/api/public/properties" → proxy at "/api/backend/api/public/properties"
    url = `/api/backend${path}`;
  } else {
    // Server-side: call Spring Boot directly
    url = `${API_BASE_URL}${path}`;
  }

  const headers: Record<string, string> = {};
  if (!opts?.noJson) headers["Content-Type"] = "application/json";
  if (hasExplicitToken) headers["Authorization"] = `Bearer ${opts!.token}`;

  const res = await fetch(url, {
    method: opts?.method ?? (opts?.body ? "POST" : "GET"),
    headers,
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
    ...(isClient ? { credentials: "same-origin" as RequestCredentials } : {}),
  });

  if (!res.ok) {
    let payload: Record<string, unknown> | null = null;
    try {
      payload = await res.json();
    } catch {
      // ignore
    }
    const err: ApiError = {
      status: res.status,
      error: (payload?.error as string) ?? "Error",
      message: (payload?.message as string) ?? `Request failed (${res.status})`,
      details: payload?.details,
    };
    throw err;
  }

  return (await res.json()) as T;
}

/** Download binary/text (e.g. CSV export). */
export async function apiDownload(
  path: string,
  opts: { token?: string | null; filename: string }
): Promise<void> {
  const isClient = typeof window !== "undefined";
  const hasExplicitToken =
    opts.token != null &&
    opts.token.trim() !== "" &&
    opts.token !== "cookie";

  let url: string;
  if (path.startsWith("http")) {
    url = path;
  } else if (isClient && !hasExplicitToken) {
    url = `/api/backend${path}`;
  } else {
    url = `${API_BASE_URL}${path}`;
  }

  const headers: Record<string, string> = {};
  if (hasExplicitToken) headers["Authorization"] = `Bearer ${opts.token!.trim()}`;

  const res = await fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
    ...(isClient ? { credentials: "same-origin" as RequestCredentials } : {}),
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const payload = await res.json();
      if (payload?.message) message = String(payload.message);
    } catch {
      // ignore
    }
    throw { status: res.status, error: "Error", message } as ApiError;
  }
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = opts.filename;
  a.click();
  URL.revokeObjectURL(href);
}
