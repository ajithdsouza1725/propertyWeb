"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAccessToken, useHydrated } from "@/lib/use-access-token";

/**
 * Gates every /seller/* panel page. Unauthenticated visitors go to /seller/login.
 * Buyers and admins are redirected to their own portals so the seller panel is never
 * visible without owner/agent credentials.
 */
export function SellerGuard({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const token = useAccessToken();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok">("loading");

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    apiFetch<{ role: string }>("/api/auth/me", { token })
      .then((me) => {
        if (cancelled) return;
        const role = (me.role ?? "").toLowerCase();
        if (role === "owner" || role === "agent") {
          setStatus("ok");
        } else if (role === "admin") {
          router.replace("/admin");
        } else if (role === "buyer") {
          router.replace("/account");
        } else {
          router.replace("/login");
        }
      })
      .catch(() => {
        if (!cancelled) router.replace("/login");
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, token, router]);

  if (status === "ok") return <>{children}</>;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span className="size-3 animate-pulse rounded-full bg-primary/40" />
        Verifying seller access…
      </div>
    </div>
  );
}
