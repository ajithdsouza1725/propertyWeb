"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCompactINR } from "@/lib/format";
import { apiFetch } from "@/lib/api";

import type { PageResponse } from "@/lib/page-response";
import { useAccessToken } from "@/lib/use-access-token";

export default function SellerPropertiesPage() {
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const token = useAccessToken();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [resubmittingId, setResubmittingId] = useState<number | null>(null);

  useEffect(() => {
    const fromUrl = searchParams.get("q") ?? "";
    setQ(fromUrl);
    setDebouncedQ(fromUrl.trim());
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setPage(0);
  }, [debouncedQ]);

  const load = useCallback(async () => {
    if (!token) {
      setRows([]);
      setTotalPages(0);
      setTotalElements(0);
      return;
    }
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("page", String(page));
      qs.set("size", "12");
      if (debouncedQ) qs.set("q", debouncedQ);
      const res = await apiFetch<PageResponse<any>>(`/api/seller/properties?${qs.toString()}`, { token });
      setRows(res.content ?? []);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      setRows([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [token, page, debouncedQ]);

  useEffect(() => {
    load();
  }, [load]);

  const pageLabel = useMemo(() => {
    if (totalElements === 0) return loading ? "Loading…" : "0 listings";
    const size = 12;
    const start = page * size + 1;
    const end = Math.min((page + 1) * size, totalElements);
    return `${totalElements} listings · ${start}–${end}`;
  }, [totalElements, page, loading]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My properties</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Properties you post go for admin approval first.
          </p>
        </div>
        <Button asChild>
          <Link href="/seller/properties/new">Add Property</Link>
        </Button>
      </div>

      <Card className="border-muted/60">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-sm flex-1">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search listings…" />
            </div>
            <div className="text-sm text-muted-foreground">{pageLabel}</div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Locality</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!token ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      Please <Link className="font-medium text-foreground hover:underline" href="/seller/login">login</Link> to see your properties.
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      No properties yet.
                    </TableCell>
                  </TableRow>
                ) : loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((p) => {
                    const approved = String(p.approvalStatus ?? "").toLowerCase() === "approved";
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.title}</TableCell>
                        <TableCell className="capitalize text-muted-foreground">
                          {(p.purpose ?? "").toLowerCase()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{p.locality ?? "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              p.approvalStatus === "approved"
                                ? "secondary"
                                : p.approvalStatus === "rejected"
                                  ? "outline"
                                  : "default"
                            }
                          >
                            {String(p.approvalStatus ?? "pending").toLowerCase() === "approved"
                              ? "Approved"
                              : String(p.approvalStatus ?? "pending").toLowerCase() === "rejected"
                                ? "Rejected"
                                : "Pending"}
                          </Badge>
                          {p.approvalStatus === "rejected" && p.rejectionReason ? (
                            <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {p.rejectionReason}
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-right">{formatCompactINR(Number(p.price ?? 0))}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="secondary" size="sm" asChild>
                              <Link
                                href={
                                  approved ? `/property/${p.slug}` : `/seller/properties/${p.id}/edit`
                                }
                              >
                                {approved ? "View" : "Preview"}
                              </Link>
                            </Button>
                            {approved ? (
                              <Button variant="outline" size="sm" disabled title="Approved listings cannot be edited">
                                Edit
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/seller/properties/${p.id}/edit`}>Edit</Link>
                              </Button>
                            )}
                            {String(p.approvalStatus ?? "").toLowerCase() === "rejected" ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                disabled={resubmittingId === p.id}
                                onClick={async () => {
                                  if (!token) return;
                                  setResubmittingId(p.id);
                                  try {
                                    await apiFetch(`/api/seller/properties/${p.id}/resubmit`, {
                                      token,
                                      method: "POST",
                                    });
                                    await load();
                                  } finally {
                                    setResubmittingId(null);
                                  }
                                }}
                              >
                                {resubmittingId === p.id ? "Resubmitting…" : "Resubmit"}
                              </Button>
                            ) : null}
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={deletingId === p.id}
                              onClick={async () => {
                                if (!token) return;
                                const ok = window.confirm("Delete this property? This cannot be undone.");
                                if (!ok) return;
                                setDeletingId(p.id);
                                try {
                                  await apiFetch(`/api/seller/properties/${p.id}`, { token, method: "DELETE" });
                                  await load();
                                } finally {
                                  setDeletingId(null);
                                }
                              }}
                            >
                              {deletingId === p.id ? "Deleting…" : "Delete"}
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

          {totalPages > 1 ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 0} onClick={() => setPage((x) => Math.max(0, x - 1))}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((x) => x + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
