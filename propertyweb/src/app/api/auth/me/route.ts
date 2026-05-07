import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mh_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Verify token is not expired by decoding payload
  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("malformed");
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8")
    );
    if (payload.exp && payload.exp < Date.now() / 1000) {
      // Token expired — delete cookie
      cookieStore.delete("mh_token");
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }
  } catch {
    cookieStore.delete("mh_token");
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Forward to Spring Boot to get full user info
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      if (res.status === 401) cookieStore.delete("mh_token");
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    const user = await res.json();
    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: "Could not verify session" },
      { status: 500 }
    );
  }
}
