"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { apiDownload, apiFetch, getApiErrorMessage } from "@/lib/api";
import type { PageResponse } from "@/lib/page-response";
import { adminDashboardApiEnabled } from "@/lib/admin-dev";
import { useAccessToken } from "@/lib/use-access-token";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Download, MessageSquare, Phone, Mail, Trash2, Pencil } from "lucide-react";

function statusBadge(status: string) {
  switch ((status ?? "").toUpperCase()) {
    case "NEW":
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">New</Badge>;
    case "ASSIGNED":
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">Assigned</Badge>;
    case "CLOSED":
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Closed</Badge>;
    case "SPAM":
      return <Badge variant="outline" className="text-muted-foreground">Spam</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function AdminEnquiriesPage() {
  const token = useAccessToken();
  const apiOk = adminDashboardApiEnabled(token);
  const [rows, setRows] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sellerFilter, setSellerFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const confirm = useConfirm();
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [selectedSellerByEnquiry, setSelectedSellerByEnquiry] = useState<Record<string, string>>({});
  const [selectedStatusByEnquiry, setSelectedStatusByEnquiry] = useState<Record<string, string>>({});
  const [exporting, setExporting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editEnqOpen, setEditEnqOpen] = useState(false);
  const [editEnqForm, setEditEnqForm] = useState<Record<string, any>>({});
  const [editEnqSaving, setEditEnqSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    let mounted = true;
    if (!apiOk) { setLoading(false); setRows([]); setSellers([]); return; }
    apiFetch<any[]>("/api/admin/sellers", { token: token ?? undefined })
      .then((r) => { if (!mounted) return; setSellers(Array.isArray(r) ? r : []); })
      .catch(() => { if (!mounted) return; setSellers([]); });
    return () => { mounted = false; };
  }, [token, apiOk]);

  /** Build the query string from current filters (shared by list + export). */
  const buildFilterQs = useCallback(() => {
    const qs = new URLSearchParams();
    if (status !== "all") qs.set("status", status.toUpperCase());
    if (debouncedQ) qs.set("q", debouncedQ);
    if (dateFrom) qs.set("dateFrom", dateFrom);
    if (dateTo) qs.set("dateTo", dateTo);
    if (sellerFilter !== "all") qs.set("sellerId", sellerFilter);
    return qs;
  }, [status, debouncedQ, dateFrom, dateTo, sellerFilter]);

  const loadEnquiries = useCallback(async () => {
    if (!apiOk) return;
    setLoading(true);
    setLoadError(null);
    try {
      const qs = buildFilterQs();
      qs.set("page", String(page));
      qs.set("size", "12");
      const res = await apiFetch<PageResponse<any>>(`/api/admin/enquiries?${qs.toString()}`, {
        token: token ?? undefined,
      });
      setRows(res.content ?? []);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (e: unknown) {
      setLoadError(getApiErrorMessage(e, "Could not load enquiries."));
      setRows([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [token, page, buildFilterQs, apiOk]);

  useEffect(() => { loadEnquiries(); }, [loadEnquiries]);
  useEffect(() => { setPage(0); }, [debouncedQ, dateFrom, dateTo, sellerFilter]);

  const pageInfo = useMemo(() => {
    if (totalElements === 0) return "0 leads";
    const size = 12;
    const start = page * size + 1;
    const end = Math.min((page + 1) * size, totalElements);
    return `${totalElements} leads · showing ${start}–${end}`;
  }, [totalElements, page]);

  return (
    <div className="space-y-6">
      {confirm.dialog}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Buyer Leads & Enquiries</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All buyer enquiries come here first. Review and assign to sellers.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={!apiOk || exporting}
          onClick={async () => {
            if (!apiOk) return;
            setExporting(true);
            try {
              // Export respects the same filters as the current list view
              const qs = buildFilterQs();
              const exportUrl = `/api/admin/enquiries/export${qs.toString() ? "?" + qs.toString() : ""}`;
              await apiDownload(exportUrl, {
                token: token ?? undefined,
                filename: "enquiries.csv",
              });
            } finally { setExporting(false); }
          }}
        >
          <Download className="size-4 mr-2" />
          {exporting ? "Exporting…" : "Export CSV"}
        </Button>
      </div>

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
      )}

      <Card>
        <CardContent className="p-5">
          {/* Filter bar — row 1: search + status + seller */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search property, buyer name, email…"
              className="max-w-sm"
            />
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sellerFilter} onValueChange={(v) => { setSellerFilter(v); setPage(0); }}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Assigned seller" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sellers</SelectItem>
                {sellers.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.fullName ?? s.email ?? `#${s.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter bar — row 2: date range + result count */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 rounded-lg border bg-background px-2.5 text-sm"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 rounded-lg border bg-background px-2.5 text-sm"
              />
            </div>
            {(dateFrom || dateTo || sellerFilter !== "all" || status !== "all" || debouncedQ) && (
              <button
                className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                onClick={() => {
                  setQ(""); setStatus("all"); setDateFrom(""); setDateTo(""); setSellerFilter("all"); setPage(0);
                }}
              >
                Clear all filters
              </button>
            )}
            <span className="ml-auto text-sm text-muted-foreground whitespace-nowrap">
              {loading ? "Loading…" : pageInfo}
            </span>
          </div>

          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>#</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assign to Seller</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!apiOk ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                      Please login as admin.
                    </TableCell>
                  </TableRow>
                ) : loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted/60" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <MessageSquare className="size-8 opacity-30" />
                        <span className="text-sm">No enquiries found.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((e) => {
                    const assignedSellerId = e.assignedSellerId ? String(e.assignedSellerId) : "";
                    const selected = selectedSellerByEnquiry[String(e.id)] ?? assignedSellerId;
                    const selectedStatus = selectedStatusByEnquiry[String(e.id)] ?? String(e.status ?? "NEW").toUpperCase();
                    return (
                      <TableRow key={e.id} className="hover:bg-muted/10 align-top">
                        <TableCell className="text-xs text-muted-foreground pt-4">#{e.id}</TableCell>
                        <TableCell className="pt-4">
                          <div className="font-medium text-sm">{e.buyerName ?? "—"}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {e.buyerPhone && (
                              <a href={`tel:${e.buyerPhone}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                <Phone className="size-3" /> {e.buyerPhone}
                              </a>
                            )}
                            {e.buyerPhone && (
                              <a
                                href={`https://wa.me/91${e.buyerPhone.replace(/\D/g,"").slice(-10)}?text=${encodeURIComponent("Hi " + (e.buyerName || "") + ", regarding your enquiry on MangaloreHomes...")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-medium text-emerald-600 hover:underline"
                              >
                                WhatsApp
                              </a>
                            )}
                          </div>
                          {e.buyerEmail && (
                            <a href={`mailto:${e.buyerEmail}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-0.5">
                              <Mail className="size-3" /> {e.buyerEmail}
                            </a>
                          )}
                          {e.message && (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground italic max-w-55">
                              &ldquo;{e.message}&rdquo;
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="pt-4">
                          <div className="text-sm font-medium">{e.propertyTitle ?? `Property #${e.propertyId}`}</div>
                          <Badge variant="outline" className="mt-1 text-xs capitalize">{String(e.source ?? "website")}</Badge>
                        </TableCell>
                        <TableCell className="pt-3">
                          <div className="flex items-center gap-1.5">
                            <Select
                              value={String(selectedStatus).toLowerCase()}
                              onValueChange={(v) => setSelectedStatusByEnquiry((m) => ({ ...m, [String(e.id)]: v.toUpperCase() }))}
                            >
                              <SelectTrigger className="h-8 w-32 text-xs">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="assigned">Assigned</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-xs"
                              disabled={updatingStatusId === e.id}
                              onClick={async () => {
                                if (!apiOk) return;
                                setUpdatingStatusId(e.id);
                                try {
                                  await apiFetch(`/api/admin/enquiries/${e.id}/status`, {
                                    token: token ?? undefined,
                                    method: "POST",
                                    body: { status: selectedStatus },
                                  });
                                  await loadEnquiries();
                                } finally { setUpdatingStatusId(null); }
                              }}
                            >
                              {updatingStatusId === e.id ? "…" : "Save"}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="pt-3">
                          <div className="flex items-center gap-1.5">
                            <Select
                              value={selected || "unassigned"}
                              onValueChange={(v) => setSelectedSellerByEnquiry((m) => ({ ...m, [String(e.id)]: v }))}
                            >
                              <SelectTrigger className="h-8 w-44 text-xs">
                                <SelectValue placeholder="Assign seller" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {sellers.map((s) => (
                                  <SelectItem key={s.id} value={String(s.id)}>
                                    {s.fullName ?? `Seller #${s.id}`}
                                    {s.businessName ? ` (${s.businessName})` : ""}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 px-2 text-xs"
                              disabled={assigningId === e.id}
                              onClick={async () => {
                                const sellerName = selected === "unassigned"
                                  ? "nobody (unassign)"
                                  : sellers.find((s) => String(s.id) === selected)?.fullName ?? `seller #${selected}`;
                                const ok = await confirm.ask({
                                  title: `Assign enquiry #${e.id}?`,
                                  body: `This lead for "${e.propertyTitle ?? "property"}" will be routed to ${sellerName}. The seller will see the buyer's contact details.`,
                                  confirmText: "Assign lead",
                                  tone: "neutral",
                                });
                                if (!ok) return;
                                setAssigningId(e.id);
                                try {
                                  await apiFetch(`/api/admin/enquiries/${e.id}/assign`, {
                                    token: token ?? undefined,
                                    method: "POST",
                                    body: selected === "unassigned" ? { sellerId: null } : { sellerId: Number(selected) },
                                  });
                                  setSelectedStatusByEnquiry((m) => ({
                                    ...m,
                                    [String(e.id)]: selected === "unassigned" ? "NEW" : "ASSIGNED",
                                  }));
                                  await loadEnquiries();
                                } finally { setAssigningId(null); }
                              }}
                            >
                              {assigningId === e.id ? "…" : "Assign"}
                            </Button>
                          </div>
                          {e.assignedSellerId && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              Currently: {sellers.find((s) => s.id === e.assignedSellerId)?.fullName ?? `#${e.assignedSellerId}`}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right pt-4">
                          <div className="text-xs text-muted-foreground">
                            {e.createdAt ? (
                              <>
                                <div>{timeAgo(e.createdAt)}</div>
                                <div className="text-muted-foreground/70">{new Date(e.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</div>
                              </>
                            ) : "—"}
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                            title="Edit enquiry"
                            onClick={() => {
                              setEditEnqForm({
                                id: e.id,
                                buyerName: e.buyerName ?? "",
                                buyerPhone: e.buyerPhone ?? "",
                                buyerEmail: e.buyerEmail ?? "",
                                message: e.message ?? "",
                              });
                              setEditEnqOpen(true);
                            }}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            onClick={async () => {
                              const ok = await confirm.ask({
                                title: `Delete enquiry #${e.id}?`,
                                body: `This will permanently remove the enquiry from "${e.buyerName ?? "buyer"}" about "${e.propertyTitle ?? "property"}".`,
                                confirmText: "Delete",
                                tone: "danger",
                              });
                              if (!ok) return;
                              try {
                                await apiFetch(`/api/admin/enquiries/${e.id}`, { token: token ?? undefined, method: "DELETE" });
                                await loadEnquiries();
                              } catch {}
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Enquiry Dialog */}
      <Dialog open={editEnqOpen} onOpenChange={setEditEnqOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit enquiry #{editEnqForm.id}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 mt-2">
            <label className="grid gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Buyer name</span>
              <Input value={editEnqForm.buyerName ?? ""} onChange={(e) => setEditEnqForm({ ...editEnqForm, buyerName: e.target.value })} />
            </label>
            <label className="grid gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Phone</span>
              <Input value={editEnqForm.buyerPhone ?? ""} onChange={(e) => setEditEnqForm({ ...editEnqForm, buyerPhone: e.target.value })} />
            </label>
            <label className="grid gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Email</span>
              <Input type="email" value={editEnqForm.buyerEmail ?? ""} onChange={(e) => setEditEnqForm({ ...editEnqForm, buyerEmail: e.target.value })} />
            </label>
            <label className="grid gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Message</span>
              <Textarea rows={3} value={editEnqForm.message ?? ""} onChange={(e) => setEditEnqForm({ ...editEnqForm, message: e.target.value })} />
            </label>
            <div className="flex justify-end gap-2 mt-1">
              <Button variant="outline" onClick={() => setEditEnqOpen(false)} disabled={editEnqSaving}>Cancel</Button>
              <Button
                disabled={editEnqSaving}
                onClick={async () => {
                  if (!editEnqForm.id) return;
                  setEditEnqSaving(true);
                  try {
                    await apiFetch(`/api/admin/enquiries/${editEnqForm.id}`, {
                      token: token ?? undefined,
                      method: "PUT",
                      body: {
                        name: editEnqForm.buyerName,
                        phone: editEnqForm.buyerPhone,
                        email: editEnqForm.buyerEmail,
                        message: editEnqForm.message,
                      },
                    });
                    setEditEnqOpen(false);
                    await loadEnquiries();
                  } catch {} finally { setEditEnqSaving(false); }
                }}
              >
                {editEnqSaving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
