"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth, useHydrated } from "@/lib/use-access-token";

/**
 * Gates every /admin/* page. Unauthenticated or non-admin visitors
 * are redirected to /login. Children only render once role is verified.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated || loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if ((user.role ?? "").toLowerCase() !== "admin") {
      router.replace("/login");
    }
  }, [hydrated, user, loading, router]);

  if (!loading && user && (user.role ?? "").toLowerCase() === "admin") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span className="size-3 animate-pulse rounded-full bg-primary/40" />
        Verifying admin access…
      </div>
    </div>
  );
}
