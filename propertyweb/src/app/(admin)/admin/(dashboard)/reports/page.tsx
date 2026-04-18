"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { adminDashboardApiEnabled } from "@/lib/admin-dev";
import { useAccessToken } from "@/lib/use-access-token";
import { ArrowRight, Download } from "lucide-react";

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

function BarRow({
  label, value, total, color,
}: {
  label: string; value: number; total: number; color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold tabular-nums">{value} <span className="font-normal text-muted-foreground">({pct}%)</span></span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AdminReportsPage() {
  const token = useAccessToken();
  const apiOk = adminDashboardApiEnabled(token);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!apiOk) { setLoading(false); return; }
    apiFetch<DashboardStats>("/api/admin/dashboard/stats", { token: token ?? undefined })
      .then((s) => { if (mounted) setStats(s); })
      .catch(() => { if (mounted) setStats(null); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [token, apiOk]);

  const totalListings = n(stats?.propertiesPending) + n(stats?.propertiesApproved) + n(stats?.propertiesRejected);
  const totalLeads = n(stats?.enquiriesNew) + n(stats?.enquiriesAssigned) + n(stats?.enquiriesClosed);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">Reports & analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live snapshot of your platform performance.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/enquiries">
            <Download className="size-4 mr-2" /> Export leads CSV
          </Link>
        </Button>
      </div>

      {!apiOk && (
        <div className="text-sm text-muted-foreground">Please sign in as admin.</div>
      )}

      {loading && <div className="text-sm text-muted-foreground">Loading analytics…</div>}

      {!loading && stats && (
        <>
          {/* Big numbers row */}
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: "Total listings", value: totalListings, color: "text-foreground" },
              { label: "Total leads", value: totalLeads, color: "text-blue-700" },
              { label: "Registered users", value: n(stats.usersTotal), color: "text-violet-700" },
              { label: "Contact messages", value: n(stats.contactMessagesTotal), color: "text-slate-700" },
            ].map((m) => (
              <Card key={m.label}>
                <CardContent className="p-5 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{m.label}</p>
                  <p className={`mt-1 text-3xl font-black tabular-nums ${m.color}`}>{m.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Listings funnel */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-base font-black tracking-tight mb-5">Listings pipeline</h2>
              <div className="space-y-4">
                <BarRow label="Pending approval" value={n(stats.propertiesPending)} total={totalListings} color="bg-amber-500" />
                <BarRow label="Approved (live)" value={n(stats.propertiesApproved)} total={totalListings} color="bg-emerald-500" />
                <BarRow label="Rejected" value={n(stats.propertiesRejected)} total={totalListings} color="bg-red-400" />
              </div>
            </CardContent>
          </Card>

          {/* Leads funnel */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-base font-black tracking-tight mb-5">Leads funnel</h2>
              <div className="space-y-4">
                <BarRow label="New (unassigned)" value={n(stats.enquiriesNew)} total={totalLeads} color="bg-blue-500" />
                <BarRow label="Assigned to seller" value={n(stats.enquiriesAssigned)} total={totalLeads} color="bg-indigo-500" />
                <BarRow label="Closed" value={n(stats.enquiriesClosed)} total={totalLeads} color="bg-emerald-500" />
              </div>
            </CardContent>
          </Card>

          {/* Conversion rates */}
          <div className="grid gap-4 sm:grid-cols-3">
            <ConversionCard
              label="Approval rate"
              value={totalListings > 0 ? Math.round((n(stats.propertiesApproved) / totalListings) * 100) : 0}
              sub={`${n(stats.propertiesApproved)} approved of ${totalListings}`}
              color="bg-emerald-500"
            />
            <ConversionCard
              label="Lead assignment rate"
              value={totalLeads > 0 ? Math.round(((n(stats.enquiriesAssigned) + n(stats.enquiriesClosed)) / totalLeads) * 100) : 0}
              sub={`${n(stats.enquiriesAssigned) + n(stats.enquiriesClosed)} assigned of ${totalLeads}`}
              color="bg-blue-500"
            />
            <ConversionCard
              label="Lead close rate"
              value={totalLeads > 0 ? Math.round((n(stats.enquiriesClosed) / totalLeads) * 100) : 0}
              sub={`${n(stats.enquiriesClosed)} closed of ${totalLeads}`}
              color="bg-violet-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" asChild>
              <Link href="/admin/enquiries">Open enquiries <ArrowRight className="size-4 ml-1" /></Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin">Back to dashboard</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function ConversionCard({
  label, value, sub, color,
}: {
  label: string; value: number; sub: string; color: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-black tabular-nums">{value}%</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}
