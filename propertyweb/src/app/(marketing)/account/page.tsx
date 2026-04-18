"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PublicPropertyCard, type PublicPropertySummary } from "@/components/property/public-property-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch, getApiErrorMessage } from "@/lib/api";

import type { PageResponse } from "@/lib/page-response";
import { Heart, MessageSquare, Bell } from "lucide-react";
import { useAccessToken, useHydrated } from "@/lib/use-access-token";

function AccountSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-10">
      <div className="h-8 w-48 rounded-md bg-muted" />
      <div className="mt-2 h-4 w-72 max-w-full rounded-md bg-muted" />
      <div className="mt-8 h-10 w-full max-w-md rounded-lg bg-muted" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-xl border bg-muted/40" />
        ))}
      </div>
    </div>
  );
}

export default function BuyerAccountPage() {
  const hydrated = useHydrated();
  const token = useAccessToken();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [saved, setSaved] = useState<PublicPropertySummary[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hard gate: buyer account is login-only. Unauthenticated visitors bounce to /login;
  // sellers/admins bounce to their own portal so nobody lingers on the wrong page.
  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (role && role !== "buyer") {
      router.replace(role === "admin" ? "/admin" : "/seller");
    }
  }, [hydrated, token, role, router]);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setRole(null);
      setSaved([]);
      setEnquiries([]);
      setNotifications([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [me, sRes, eRes, nRes] = await Promise.all([
        apiFetch<{ role: string }>("/api/auth/me", { token }),
        apiFetch<PageResponse<PublicPropertySummary>>("/api/account/saved?page=0&size=24", { token }),
        apiFetch<PageResponse<any>>("/api/account/enquiries?page=0&size=24", { token }),
        apiFetch<PageResponse<any>>("/api/account/notifications?page=0&size=30", { token }),
      ]);
      const r = me.role?.toLowerCase() ?? null;
      setRole(r);
      if (r !== "buyer") {
        setSaved([]);
        setEnquiries([]);
        setNotifications([]);
        setLoading(false);
        return;
      }
      setSaved(sRes.content ?? []);
      setEnquiries(eRes.content ?? []);
      setNotifications(nRes.content ?? []);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Could not load your account."));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  // While hydrating / redirecting, show a lightweight placeholder so no protected
  // content flashes before the redirect effect runs.
  if (!hydrated || !token || (role && role !== "buyer")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="size-3 animate-pulse rounded-full bg-primary/40" />
          Checking your session…
        </div>
      </div>
    );
  }

  if (loading) {
    return <AccountSkeleton />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">My account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Saved homes, enquiries you sent, and notifications.</p>

      {error ? (
        <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">{error}</div>
      ) : null}

      <Tabs defaultValue="saved" className="mt-8">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="saved" className="gap-1">
            <Heart className="size-3.5" />
            Saved
          </TabsTrigger>
          <TabsTrigger value="enquiries" className="gap-1">
            <MessageSquare className="size-3.5" />
            Enquiries
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1">
            <Bell className="size-3.5" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="mt-6">
          {saved.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {saved.map((p) => (
                <PublicPropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <Card className="border-muted/60">
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No saved listings yet. Tap “Save” on a property you like.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="enquiries" className="mt-6 space-y-3">
          {enquiries.length ? (
            enquiries.map((e) => (
              <Card key={e.id} className="border-muted/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {e.propertyTitle ?? `Property #${e.propertyId}`}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{String(e.status ?? "NEW")}</Badge>
                    <span>{e.createdAt ? new Date(e.createdAt).toLocaleString() : ""}</span>
                  </div>
                </CardHeader>
                <CardContent className="text-sm">
                  {e.message ? <p className="text-muted-foreground">{e.message}</p> : null}
                  <Button variant="link" className="mt-2 h-auto px-0" asChild>
                    <Link href={e.propertySlug ? `/property/${e.propertySlug}` : "/listings"}>
                      View property
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-muted/60">
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                You haven’t sent any enquiries while signed in. Submit one from a listing page.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-2">
          {notifications.length ? (
            notifications.map((n) => (
              <Card key={n.id} className={n.read ? "border-muted/60 opacity-70" : "border-muted/60"}>
                <CardContent className="p-4 text-sm">
                  <div className="font-medium">{n.title}</div>
                  <div className="mt-1 text-muted-foreground">{n.message}</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                  </div>
                  {!n.read ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={async () => {
                        if (!token) return;
                        await apiFetch(`/api/account/notifications/${n.id}/read`, { token, method: "POST" });
                        load();
                      }}
                    >
                      Mark read
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-muted/60">
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No notifications yet.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
