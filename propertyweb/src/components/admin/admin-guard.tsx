"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAccessToken, useHydrated } from "@/lib/use-access-token";

/**
 * Gates every /admin/* page. No dev bypass — unauthenticated or non-admin visitors
 * are redirected to /admin/login immediately. Children only render once the token
 * has been verified and the role is admin.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
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
        if ((me.role ?? "").toLowerCase() === "admin") {
          setStatus("ok");
        } else {
          // Logged in but wrong role — send them to the admin login so they can switch.
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
        Verifying admin access…
      </div>
    </div>
  );
}
