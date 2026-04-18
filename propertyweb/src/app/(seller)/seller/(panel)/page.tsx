"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCompactINR } from "@/lib/format";
import { apiFetch } from "@/lib/api";

import { useAccessToken } from "@/lib/use-access-token";

export default function SellerDashboardPage() {
  const token = useAccessToken();
  const [propsRows, setPropsRows] = useState<any[]>([]);
  const [leadRows, setLeadRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!token) {
      setPropsRows([]);
      setLeadRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.allSettled([
      apiFetch<{ content: any[] }>("/api/seller/properties?page=0&size=100", { token }),
      apiFetch<{ content: any[] }>("/api/seller/enquiries?page=0&size=100", { token }),
    ])
      .then((r) => {
        if (!mounted) return;
        setPropsRows(r[0].status === "fulfilled" ? r[0].value.content ?? [] : []);
        setLeadRows(r[1].status === "fulfilled" ? r[1].value.content ?? [] : []);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [token]);

  const stats = useMemo(() => {
    const total = propsRows.length;
    const pending = propsRows.filter((p) => String(p.approvalStatus ?? "").toLowerCase() === "pending").length;
    const approved = propsRows.filter((p) => String(p.approvalStatus ?? "").toLowerCase() === "approved").length;
    const leads = leadRows.length;
    return { total, approved, pending, leads };
  }, [propsRows, leadRows]);

  const recent = useMemo(() => propsRows.slice(0, 5), [propsRows]);
  const recentLeads = useMemo(() => leadRows.slice(0, 5), [leadRows]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Seller dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quick overview of listings, approvals, and leads.
          </p>
        </div>
        <Button asChild>
          <Link href="/seller/properties/new">Add Property</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total listings", value: token ? (loading ? "—" : stats.total) : 0 },
          { label: "Approved", value: token ? (loading ? "—" : stats.approved) : 0 },
          { label: "Pending approval", value: token ? (loading ? "—" : stats.pending) : 0 },
          { label: "Assigned leads", value: token ? (loading ? "—" : stats.leads) : 0 },
        ].map((s) => (
          <Card key={s.label} className="border-muted/60">
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-muted/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold tracking-tight">Recent listings</div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/seller/properties">View all</Link>
              </Button>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!token ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                        Please <Link className="font-medium text-foreground hover:underline" href="/seller/login">login</Link>.
                      </TableCell>
                    </TableRow>
                  ) : loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                        Loading…
                      </TableCell>
                    </TableRow>
                  ) : recent.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                        No listings yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recent.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.title ?? `#${p.id}`}</TableCell>
                        <TableCell className="capitalize text-muted-foreground">
                          {String(p.purpose ?? "").toLowerCase()}
                        </TableCell>
                        <TableCell className="text-right">{formatCompactINR(Number(p.price ?? 0))}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold tracking-tight">Recent enquiries</div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/seller/enquiries">View all</Link>
              </Button>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!token ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                        Please <Link className="font-medium text-foreground hover:underline" href="/seller/login">login</Link>.
                      </TableCell>
                    </TableRow>
                  ) : loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                        Loading…
                      </TableCell>
                    </TableRow>
                  ) : recentLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                        No assigned leads yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentLeads.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>
                          <div className="font-medium">{`Lead #${e.id}`}</div>
                          <div className="text-xs text-muted-foreground">{e.propertyTitle ?? "—"}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              e.status === "new" ? "default" : e.status === "contacted" ? "secondary" : "outline"
                            }
                            className="capitalize"
                          >
                            {String(e.status ?? "new")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

