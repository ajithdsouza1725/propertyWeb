import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side route protection. Checks the httpOnly mh_token cookie
 * and redirects unauthenticated users away from protected routes.
 * Does NOT call Spring Boot — only decodes the JWT to check expiry.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("mh_token")?.value;
  const isValidToken = token ? isTokenNotExpired(token) : false;

  // Protected routes — require valid cookie
  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/seller") ||
    pathname.startsWith("/account");

  if (isProtected && !isValidToken) {
    // Expired token — delete it
    if (token && !isValidToken) {
      const res = NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
      );
      res.cookies.delete("mh_token");
      return res;
    }
    return NextResponse.redirect(
      new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
    );
  }

  // Already logged in — redirect away from login/signup
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  if (isAuthPage && isValidToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

/** Decode JWT payload and check exp claim. No signature verification. */
function isTokenNotExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    // Base64url decode
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (!payload.exp) return true; // no expiry = assume valid
    return payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/seller/:path*",
    "/account/:path*",
    "/login",
    "/signup",
  ],
};
