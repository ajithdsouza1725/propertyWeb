"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { propertyTypeBadgeClass } from "@/lib/property-type-style";
import { cn } from "@/lib/utils";
import { adminDashboardApiEnabled } from "@/lib/admin-dev";
import { useAccessToken } from "@/lib/use-access-token";
import {
  Building2,
  Users,
  MessageSquare,
  Inbox,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  TrendingUp,
  Activity,
  Phone,
  Mail,
} from "lucide-react";

type DashboardStats = {
  propertiesPending?: number;
  propertiesApproved?: number;
  propertiesRejected?: number;
  usersTotal?: number;
  enquiriesNew?: number;
  enquiriesAssigned?: number;
  enquiriesClosed?: number;
  contactMessagesTotal?: number;
};

function n(v: unknown) {
  return typeof v === "number" ? v : 0;
}

function StatCard({
  label, value, icon, href, loading, accent,
}: {
  label: string; value: number | string; icon: React.ReactNode;
  href?: string; loading?: boolean; accent: string;
}) {
  const inner = (
    <div className={`group relative overflow-hidden rounded-2xl border p-5 transition-all hover:shadow-md ${accent}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
          {loading ? (
            <div className="h-8 w-16 animate-pulse rounded-lg bg-current opacity-20" />
          ) : (
            <p className="text-3xl font-black tabular-nums">{value}</p>
          )}
        </div>
        <div className="rounded-xl p-2 opacity-80">{icon}</div>
      </div>
      {href && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium opacity-60 group-hover:opacity-100 transition-opacity">
          View all <ArrowRight className="size-3" />
        </div>
      )}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function AdminDashboardPage() {
  const token = useAccessToken();
  const apiOk = adminDashboardApiEnabled(token);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingProperties, setPendingProperties] = useState<any[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    if (!apiOk) return;
    setLoading(true);
    setError(null);
    Promise.all([
      apiFetch<DashboardStats>("/api/admin/dashboard/stats", { token: token ?? undefined }),
      apiFetch<any[]>("/api/admin/properties?status=pending", { token: token ?? undefined }),
      apiFetch<any>("/api/admin/enquiries?size=5", { token: token ?? undefined }),
    ])
      .then(([s, pending, enq]) => {
        if (!mounted) return;
        setStats(s);
        setPendingProperties(Array.isArray(pending) ? pending.slice(0, 5) : []);
        setRecentEnquiries(Array.isArray(enq?.content) ? enq.content.slice(0, 5) : []);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Could not load dashboard data. Check your connection and refresh.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [token, apiOk]);

  // Conversion rates
  const totalListings = n(stats?.propertiesPending) + n(stats?.propertiesApproved) + n(stats?.propertiesRejected);
  const approvalRate = totalListings > 0 ? Math.round((n(stats?.propertiesApproved) / totalListings) * 100) : 0;
  const totalLeads = n(stats?.enquiriesNew) + n(stats?.enquiriesAssigned) + n(stats?.enquiriesClosed);
  const assignRate = totalLeads > 0 ? Math.round(((n(stats?.enquiriesAssigned) + n(stats?.enquiriesClosed)) / totalLeads) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what needs your attention today.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/properties">
            Review properties <ArrowRight className="ml-1.5 size-4" />
          </Link>
        </Button>
      </div>

      {!apiOk && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          Please <Link href="/login" className="font-semibold underline">sign in as admin</Link> to view this dashboard.
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
          {error}
          <Button variant="outline" size="sm" className="ml-4" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}

      {apiOk && (
        <>
          {/* KPI Cards */}
          <div>
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Properties</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Pending approval" value={n(stats?.propertiesPending)} icon={<Clock className="size-6 text-amber-600" />} accent="bg-amber-50 border-amber-200 text-amber-900" href="/admin/properties?tab=pending" loading={loading} />
              <StatCard label="Approved & live" value={n(stats?.propertiesApproved)} icon={<CheckCircle2 className="size-6 text-emerald-600" />} accent="bg-emerald-50 border-emerald-200 text-emerald-900" href="/admin/properties?tab=approved" loading={loading} />
              <StatCard label="Rejected" value={n(stats?.propertiesRejected)} icon={<XCircle className="size-6 text-red-500" />} accent="bg-red-50 border-red-200 text-red-900" href="/admin/properties?tab=rejected" loading={loading} />
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Leads & users</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="New enquiries" value={n(stats?.enquiriesNew)} icon={<MessageSquare className="size-6 text-blue-600" />} accent="bg-blue-50 border-blue-200 text-blue-900" href="/admin/enquiries" loading={loading} />
              <StatCard label="Assigned leads" value={n(stats?.enquiriesAssigned)} icon={<TrendingUp className="size-6 text-indigo-600" />} accent="bg-indigo-50 border-indigo-200 text-indigo-900" href="/admin/enquiries" loading={loading} />
              <StatCard label="Total users" value={n(stats?.usersTotal)} icon={<Users className="size-6 text-violet-600" />} accent="bg-violet-50 border-violet-200 text-violet-900" href="/admin/users" loading={loading} />
              <StatCard label="Contact messages" value={n(stats?.contactMessagesTotal)} icon={<Inbox className="size-6 text-slate-600" />} accent="bg-slate-50 border-slate-200 text-slate-900" href="/admin/contact-messages" loading={loading} />
            </div>
          </div>

          {/* Conversion metrics */}
          {!loading && stats && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Approval rate</p>
                      <p className="mt-1 text-2xl font-black tabular-nums">{approvalRate}%</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{n(stats.propertiesApproved)} of {totalListings} listings</div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${approvalRate}%` }} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Lead assignment rate</p>
                      <p className="mt-1 text-2xl font-black tabular-nums">{assignRate}%</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{n(stats.enquiriesAssigned) + n(stats.enquiriesClosed)} of {totalLeads} leads</div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${assignRate}%` }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Two-column: Pending properties + Recent enquiries */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pending approvals */}
            <Card className="border-amber-200/60">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-amber-600" />
                    <h3 className="font-bold text-amber-900">Pending approvals</h3>
                    {pendingProperties.length > 0 && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">{pendingProperties.length}</Badge>
                    )}
                  </div>
                  <Button asChild variant="outline" size="sm" className="border-amber-300 text-amber-800 hover:bg-amber-50">
                    <Link href="/admin/properties">View all</Link>
                  </Button>
                </div>
                {pendingProperties.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">No pending listings. All caught up!</p>
                ) : (
                  <div className="space-y-2">
                    {pendingProperties.map((p) => (
                      <Link
                        key={p.id}
                        href={`/admin/properties/${p.id}`}
                        className="flex items-center justify-between rounded-xl border border-amber-200/60 bg-white px-4 py-3 text-sm transition-colors hover:bg-amber-50"
                      >
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate">{p.title}</div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <span>{p.sellerName ?? "Unknown"}</span>
                            <span className="opacity-40">·</span>
                            <span>{p.locality ?? "—"}</span>
                            {p.propertyTypeSlug && (
                              <>
                                <span className="opacity-40">·</span>
                                <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold", propertyTypeBadgeClass(p.propertyTypeSlug))}>{p.propertyType ?? "—"}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground ml-2" />
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent enquiries — NEW feature */}
            <Card>
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-blue-600" />
                    <h3 className="font-bold">Recent enquiries</h3>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/enquiries">View all</Link>
                  </Button>
                </div>
                {recentEnquiries.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">No enquiries yet.</p>
                ) : (
                  <div className="space-y-2">
                    {recentEnquiries.map((e) => (
                      <div key={e.id} className="flex items-start gap-3 rounded-xl border px-4 py-3">
                        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                          <MessageSquare className="size-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{e.buyerName ?? "Anonymous"}</span>
                            <Badge variant="outline" className={cn("text-[10px]",
                              e.status === "NEW" ? "border-blue-200 text-blue-700" :
                              e.status === "ASSIGNED" ? "border-amber-200 text-amber-700" :
                              "border-emerald-200 text-emerald-700"
                            )}>{(e.status ?? "NEW").toLowerCase()}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {e.propertyTitle ?? "Property enquiry"}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                            {e.buyerPhone && <span className="flex items-center gap-1"><Phone className="size-3" />{e.buyerPhone}</span>}
                            {e.buyerEmail && <span className="flex items-center gap-1"><Mail className="size-3" />{e.buyerEmail}</span>}
                          </div>
                        </div>
                        <div className="text-[11px] text-muted-foreground shrink-0">
                          {e.createdAt ? new Date(e.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Quick actions</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { href: "/admin/properties", label: "Manage properties", desc: "Approve, reject, review", icon: <Building2 className="size-5" /> },
                { href: "/admin/enquiries", label: "Manage leads", desc: "Assign buyers to sellers", icon: <MessageSquare className="size-5" /> },
                { href: "/admin/users", label: "Manage users", desc: "Buyers, sellers, agents", icon: <Users className="size-5" /> },
                { href: "/admin/contact-messages", label: "Contact inbox", desc: "Public messages", icon: <Inbox className="size-5" /> },
                { href: "/admin/locations", label: "Locations", desc: "Manage localities", icon: <Building2 className="size-5" /> },
                { href: "/admin/marketing", label: "Marketing", desc: "Banners & testimonials", icon: <TrendingUp className="size-5" /> },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-start gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
                >
                  <div className="mt-0.5 shrink-0 text-muted-foreground">{item.icon}</div>
                  <div>
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
