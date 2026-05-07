import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/** Decode JWT payload without verification (verification is on Spring Boot). */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8")
    );
    return payload;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Forward to Spring Boot
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let message = "Invalid credentials";
      try {
        const err = await res.json();
        if (err?.message) message = String(err.message);
      } catch {
        // ignore
      }
      return NextResponse.json({ error: message }, { status: res.status });
    }

    const data = await res.json();
    const token =
      typeof data.token === "string"
        ? data.token
        : typeof data.accessToken === "string"
          ? data.accessToken
          : null;

    if (!token) {
      return NextResponse.json(
        { error: "No token in response" },
        { status: 500 }
      );
    }

    // Decode role from JWT
    const payload = decodeJwtPayload(token);
    const role = (payload?.role as string) ?? "buyer";

    // Set httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set("mh_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({ success: true, role });
  } catch {
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
