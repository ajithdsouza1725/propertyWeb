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
export async function apiUploadSellerFile(token: string, file: File): Promise<{ url: string }> {
  const url = `${API_BASE_URL}/api/seller/uploads`;
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
    cache: "no-store",
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

export async function apiFetch<T>(
  path: string,
  opts?: {
    method?: string;
    token?: string | null;
    body?: unknown;
    noJson?: boolean;
  }
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: opts?.method ?? (opts?.body ? "POST" : "GET"),
    headers: {
      ...(opts?.noJson ? {} : { "Content-Type": "application/json" }),
      ...(opts?.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    let payload: any = null;
    try {
      payload = await res.json();
    } catch {
      // ignore
    }
    const err: ApiError = {
      status: res.status,
      error: payload?.error ?? "Error",
      message: payload?.message ?? `Request failed (${res.status})`,
      details: payload?.details,
    };
    throw err;
  }

  return (await res.json()) as T;
}

/** Download binary/text (e.g. CSV export). Bearer header omitted when {@code token} is empty. */
export async function apiDownload(
  path: string,
  opts: { token?: string | null; filename: string }
): Promise<void> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: "GET",
    headers: opts.token?.trim() ? { Authorization: `Bearer ${opts.token.trim()}` } : {},
    cache: "no-store",
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

