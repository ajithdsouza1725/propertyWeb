import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/**
 * Generic backend proxy. Client-side fetch calls to `/api/backend/...`
 * are forwarded to Spring Boot with the httpOnly cookie's JWT as
 * a Bearer token. Handles GET, POST, PUT, DELETE with JSON or multipart.
 */
async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const backendPath = `/api/${path.join("/")}`;
  const url = new URL(request.url);
  const query = url.search; // includes leading ?

  const cookieStore = await cookies();
  const token = cookieStore.get("mh_token")?.value;

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Forward content-type
  const contentType = request.headers.get("content-type");
  if (contentType && !contentType.includes("multipart")) {
    headers["Content-Type"] = contentType;
  }

  // Build body
  let body: BodyInit | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    if (contentType?.includes("multipart")) {
      // Forward raw form data
      body = await request.blob();
      // Let fetch set the content-type with boundary
    } else {
      body = await request.text();
    }
  }

  try {
    const res = await fetch(`${API_BASE}${backendPath}${query}`, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    // Stream response back
    const resHeaders = new Headers();
    const resContentType = res.headers.get("content-type");
    if (resContentType) resHeaders.set("content-type", resContentType);

    return new NextResponse(res.body, {
      status: res.status,
      headers: resHeaders,
    });
  } catch {
    return NextResponse.json(
      { error: "Backend unavailable" },
      { status: 502 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;
