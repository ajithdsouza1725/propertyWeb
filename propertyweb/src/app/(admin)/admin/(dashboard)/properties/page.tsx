"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCompactINR } from "@/lib/format";
import { propertyTypeBadgeClass } from "@/lib/property-type-style";
import { cn } from "@/lib/utils";
import { apiFetch, mediaAbsoluteUrl } from "@/lib/api";
import { adminDashboardApiEnabled } from "@/lib/admin-dev";
import { useAccessToken } from "@/lib/use-access-token";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { CheckCircle2, XCircle, Eye, Home, Clock, Star, Phone, Image, Trash2, Pencil } from "lucide-react";

const tabs = [
  { key: "pending", label: "Pending", icon: <Clock className="size-3.5" /> },
  { key: "approved", label: "Approved", icon: <CheckCircle2 className="size-3.5" /> },
  { key: "rejected", label: "Rejected", icon: <XCircle className="size-3.5" /> },
] as const;

function approvalBadge(status: string) {
  switch (status?.toLowerCase()) {
    case "approved":
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">Approved</Badge>;
    case "rejected":
      return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">Rejected</Badge>;
    default:
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">Pending</Badge>;
  }
}

function purposeBadge(purpose: string) {
  const label = (purpose ?? "").toLowerCase();
  if (label === "buy") return <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">Buy</Badge>;
  if (label === "rent") return <Badge variant="outline" className="text-xs border-green-200 text-green-700">Rent</Badge>;
  return <Badge variant="outline" className="text-xs">{label}</Badge>;
}

export default function AdminPropertiesPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("pending");
  const [q, setQ] = useState("");
  const [rowsRaw, setRowsRaw] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useAccessToken();
  const apiOk = adminDashboardApiEnabled(token);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const confirm = useConfirm();

  const rows = useMemo(() => {
    if (!q.trim()) return rowsRaw;
    const s = q.trim().toLowerCase();
    return rowsRaw.filter((p) =>
      `${p.title ?? ""} ${p.locality ?? ""} ${p.sellerName ?? ""} ${p.sellerEmail ?? ""}`.toLowerCase().includes(s)
    );
  }, [rowsRaw, q]);

  useEffect(() => {
    let mounted = true;
    if (!apiOk) { setLoading(false); setRowsRaw([]); return; }
    setLoading(true);
    apiFetch<any[]>(`/api/admin/properties?status=${tab}`, { token: token ?? undefined })
      .then((r) => { if (!mounted) return; setRowsRaw(r); })
      .catch(() => { if (!mounted) return; setRowsRaw([]); })
      .finally(() => { if (!mounted) return; setLoading(false); });
    return () => { mounted = false; };
  }, [token, tab, apiOk]);

  const tabCounts = useMemo(() => ({
    pending: tab === "pending" ? rows.length : "…",
    approved: tab === "approved" ? rows.length : "…",
    rejected: tab === "rejected" ? rows.length : "…",
  }), [rows, tab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">Manage Properties</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Approve or reject listings, view seller and lead details.
          </p>
        </div>
      </div>

      {confirm.dialog}

      {/* Action feedback banners */}
      {actionSuccess && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-center justify-between">
          {actionSuccess}
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-800 text-xs font-medium">Dismiss</button>
        </div>
      )}
      {actionError && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-center justify-between">
          {actionError}
          <button onClick={() => setActionError(null)} className="text-destructive hover:text-destructive/80 text-xs font-medium">Dismiss</button>
        </div>
      )}

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, locality, seller name…"
              className="max-w-sm"
            />
            <div className="text-sm text-muted-foreground">
              {loading ? "Loading…" : `${rows.length} properties`}
            </div>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="h-10">
              {tabs.map((t) => (
                <TabsTrigger key={t.key} value={t.key} className="flex items-center gap-1.5 px-4">
                  {t.icon}
                  {t.label}
                  <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                    {tabCounts[t.key]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={tab} className="mt-4">
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Type / Purpose</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!apiOk ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                          Please{" "}
                          <Link className="font-medium text-foreground hover:underline" href="/login">
                            login
                          </Link>{" "}
                          as admin.
                        </TableCell>
                      </TableRow>
                    ) : loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 7 }).map((_, j) => (
                            <TableCell key={j}>
                              <div className="h-4 w-full animate-pulse rounded bg-muted/60" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Home className="size-8 opacity-30" />
                            <span className="text-sm">No {tab} properties found.</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      rows.map((p) => (
                        <TableRow key={p.id} className="hover:bg-muted/20">
                          <TableCell className="pl-4">
                            {p.thumbUrl ? (
                              <img
                                src={mediaAbsoluteUrl(p.thumbUrl)}
                                alt=""
                                className="size-10 rounded-lg object-cover border"
                              />
                            ) : (
                              <div className="size-10 rounded-lg border bg-muted/40 flex items-center justify-center">
                                <Home className="size-4 text-muted-foreground/50" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium leading-snug">{p.title}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {p.locality ?? "—"}
                              {p.bedrooms ? ` • ${p.bedrooms} BHK` : ""}
                              {p.areaSqft ? ` • ${p.areaSqft} sqft` : ""}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-sm">{p.sellerName ?? "—"}</div>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              {p.sellerPhone && (
                                <a href={`tel:${p.sellerPhone}`} className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline">
                                  <Phone className="size-3" />{p.sellerPhone}
                                </a>
                              )}
                              {p.sellerPhone && (
                                <a
                                  href={`https://wa.me/91${p.sellerPhone.replace(/\D/g,"").slice(-10)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-emerald-600 hover:underline"
                                >
                                  WhatsApp
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span
                                className={cn(
                                  "inline-flex w-fit rounded-md px-2 py-0.5 text-[11px] font-semibold",
                                  propertyTypeBadgeClass(String(p.propertyTypeSlug ?? ""))
                                )}
                              >
                                {p.propertyType ?? "—"}
                              </span>
                              {purposeBadge(p.purpose)}
                            </div>
                          </TableCell>
                          <TableCell>{approvalBadge(p.approvalStatus)}</TableCell>
                          <TableCell className="text-right">
                            <div className="font-bold tabular-nums">{formatCompactINR(Number(p.price ?? 0))}</div>
                            {p.areaSqft && Number(p.areaSqft) > 0 && (
                              <div className="text-[11px] text-muted-foreground tabular-nums">
                                ₹{Math.round(Number(p.price) / Number(p.areaSqft)).toLocaleString("en-IN")}/sqft
                              </div>
                            )}
                            <div className="flex items-center justify-end gap-1.5 mt-1">
                              {p.isFeatured && (
                                <Star className="size-3.5 fill-amber-400 text-amber-400" aria-label="Featured" />
                              )}
                              {p.imageCount > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
                                  <Image className="size-3" />{p.imageCount}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {String(p.approvalStatus ?? "").toLowerCase() === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    disabled={actingId === p.id}
                                    onClick={async () => {
                                      if (!apiOk) return;
                                      setActingId(p.id);
                                      setActionError(null);
                                      setActionSuccess(null);
                                      try {
                                        await apiFetch(`/api/admin/properties/${p.id}/approve`, {
                                          token: token ?? undefined,
                                          method: "POST",
                                        });
                                        setRowsRaw((prev) => prev.filter((x) => x.id !== p.id));
                                        setActionSuccess(`"${p.title}" approved — now live on the public site.`);
                                      } catch {
                                        setActionError(`Failed to approve "${p.title}". Please retry.`);
                                      } finally { setActingId(null); }
                                    }}
                                  >
                                    {actingId === p.id ? "Approving…" : "Approve"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-200 text-red-700 hover:bg-red-50"
                                    disabled={actingId === p.id}
                                    onClick={() => { setRejectingId(p.id); setRejectReason(""); setRejectOpen(true); }}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              {/* Featured toggle */}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                title={p.isFeatured ? "Remove from featured" : "Mark as featured"}
                                disabled={actingId === p.id}
                                onClick={async () => {
                                  if (!apiOk) return;
                                  setActingId(p.id);
                                  try {
                                    const res = await apiFetch<{ isFeatured: boolean }>(`/api/admin/properties/${p.id}/featured`, { token: token ?? undefined, method: "POST" });
                                    setRowsRaw((prev) => prev.map((x) => x.id === p.id ? { ...x, isFeatured: res.isFeatured } : x));
                                  } finally { setActingId(null); }
                                }}
                              >
                                <Star className={cn("size-4", p.isFeatured ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
                              </Button>

                              {/* Review */}
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/properties/${p.id}`}>
                                  <Eye className="size-3.5 mr-1" /> View
                                </Link>
                              </Button>

                              {/* Delete */}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                disabled={actingId === p.id}
                                onClick={async () => {
                                  const ok = await confirm.ask({
                                    title: `Delete "${p.title}"?`,
                                    body: "This will permanently remove the property, all its images, and any linked enquiries. This cannot be undone.",
                                    confirmText: "Delete permanently",
                                    tone: "danger",
                                  });
                                  if (!ok) return;
                                  setActingId(p.id);
                                  try {
                                    await apiFetch(`/api/admin/properties/${p.id}`, { token: token ?? undefined, method: "DELETE" });
                                    setRowsRaw((prev) => prev.filter((x) => x.id !== p.id));
                                    setActionSuccess(`"${p.title}" deleted.`);
                                  } catch {
                                    setActionError(`Failed to delete "${p.title}".`);
                                  } finally { setActingId(null); }
                                }}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Property</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Provide a clear reason so the seller can fix and resubmit.
          </p>
          <div className="grid gap-3">
            <Input
              placeholder="Reason for rejection (required)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => { setRejectOpen(false); setRejectingId(null); setRejectReason(""); }}
                disabled={actingId != null}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={!apiOk || actingId != null || !rejectingId || !rejectReason.trim()}
                onClick={async () => {
                  if (!apiOk || !rejectingId) return;
                  setActingId(rejectingId);
                  setActionError(null);
                  setActionSuccess(null);
                  try {
                    const title = rowsRaw.find((r) => r.id === rejectingId)?.title ?? "Property";
                    await apiFetch(`/api/admin/properties/${rejectingId}/reject`, {
                      token: token ?? undefined,
                      method: "POST",
                      body: { reason: rejectReason.trim() },
                    });
                    setRowsRaw((prev) => prev.filter((x) => x.id !== rejectingId));
                    setRejectOpen(false);
                    setRejectingId(null);
                    setRejectReason("");
                    setActionSuccess(`"${title}" rejected — seller has been notified.`);
                  } catch {
                    setActionError("Failed to reject property. Please retry.");
                  } finally { setActingId(null); }
                }}
              >
                {actingId === rejectingId ? "Rejecting…" : "Reject Listing"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
