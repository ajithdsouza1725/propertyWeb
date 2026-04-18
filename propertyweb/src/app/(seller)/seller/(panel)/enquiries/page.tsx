"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiFetch } from "@/lib/api";

import type { PageResponse } from "@/lib/page-response";
import { useAccessToken } from "@/lib/use-access-token";

export default function SellerEnquiriesPage() {
  const searchParams = useSearchParams();
  const token = useAccessToken();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

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
      const res = await apiFetch<PageResponse<any>>(`/api/seller/enquiries?${qs.toString()}`, { token });
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
    if (totalElements === 0) return loading ? "Loading…" : "0 leads";
    const size = 12;
    const start = page * size + 1;
    const end = Math.min((page + 1) * size, totalElements);
    return `${totalElements} leads · ${start}–${end}`;
  }, [totalElements, page, loading]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Enquiries</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You’ll only see leads assigned by admin.
        </p>
      </div>

      <Card className="border-muted/60">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-sm flex-1">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by property or lead id…" />
            </div>
            <div className="text-sm text-muted-foreground">{pageLabel}</div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!token ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      Please <Link className="font-medium text-foreground hover:underline" href="/seller/login">login</Link> to view assigned leads.
                    </TableCell>
                  </TableRow>
                ) : loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      No assigned leads yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="font-medium">{`Lead #${e.id}`}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{e.propertyTitle ?? "—"}</TableCell>
                      <TableCell>
                        <div className="font-medium">{e.buyerName ?? "—"}</div>
                        {e.buyerPhone ? <div className="text-xs text-muted-foreground">{e.buyerPhone}</div> : null}
                        {e.buyerEmail ? <div className="text-xs text-muted-foreground">{e.buyerEmail}</div> : null}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{e.message ?? "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            String(e.status).toLowerCase() === "new"
                              ? "default"
                              : String(e.status).toLowerCase() === "assigned"
                                ? "secondary"
                                : "outline"
                          }
                          className="capitalize"
                        >
                          {String(e.status ?? "NEW").toLowerCase()}
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
