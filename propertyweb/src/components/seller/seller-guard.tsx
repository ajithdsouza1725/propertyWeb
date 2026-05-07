"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth, useHydrated } from "@/lib/use-access-token";

/**
 * Gates every /seller/* panel page. Unauthenticated visitors go to /login.
 * Buyers and admins are redirected to their own portals.
 */
export function SellerGuard({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated || loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    const role = (user.role ?? "").toLowerCase();
    if (role === "admin") {
      router.replace("/admin");
    } else if (role === "buyer") {
      router.replace("/account");
    } else if (role !== "owner" && role !== "agent") {
      router.replace("/login");
    }
  }, [hydrated, user, loading, router]);

  const role = (user?.role ?? "").toLowerCase();
  if (!loading && user && (role === "owner" || role === "agent")) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span className="size-3 animate-pulse rounded-full bg-primary/40" />
        Verifying seller access…
      </div>
    </div>
  );
}
