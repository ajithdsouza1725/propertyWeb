"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import type { PageResponse } from "@/lib/page-response";
import { adminDashboardApiEnabled } from "@/lib/admin-dev";
import { useAccessToken } from "@/lib/use-access-token";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Inbox, Phone, Mail, Check, Eye, Trash2 } from "lucide-react";

type Row = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  createdAt: string;
};

// Client-side read tracking — stored in localStorage so the admin sees which
// messages they've already reviewed. No backend migration required.
const READ_KEY = "pw_admin_read_messages";
function getReadIds(): Set<number> {
  try {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}
function markAsRead(id: number) {
  const s = getReadIds();
  s.add(id);
  try { localStorage.setItem(READ_KEY, JSON.stringify([...s])); } catch {}
}
function markAllAsRead(ids: number[]) {
  const s = getReadIds();
  ids.forEach((id) => s.add(id));
  try { localStorage.setItem(READ_KEY, JSON.stringify([...s])); } catch {}
}

export default function AdminContactMessagesPage() {
  const token = useAccessToken();
  const apiOk = adminDashboardApiEnabled(token);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const confirm = useConfirm();

  useEffect(() => { setReadIds(getReadIds()); }, []);

  const load = useCallback(async () => {
    if (!apiOk) { setRows([]); return; }
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("page", String(page));
      qs.set("size", "20");
      const res = await apiFetch<PageResponse<Row>>(`/api/admin/contact-messages?${qs.toString()}`, {
        token: token ?? undefined,
      });
      setRows((res.content ?? []) as Row[]);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      setRows([]); setTotalPages(0); setTotalElements(0);
    } finally { setLoading(false); }
  }, [token, page, apiOk]);

  useEffect(() => { load(); }, [load]);

  const unreadCount = useMemo(
    () => rows.filter((m) => !readIds.has(m.id)).length,
    [rows, readIds],
  );

  function handleRead(id: number) {
    markAsRead(id);
    setReadIds(new Set(readIds).add(id));
    setExpandedId(expandedId === id ? null : id);
  }

  function handleMarkAllRead() {
    markAllAsRead(rows.map((m) => m.id));
    setReadIds(getReadIds());
  }

  return (
    <div className="space-y-6">
      {confirm.dialog}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Contact inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Messages from the public contact form.
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-blue-100 text-blue-700 border-blue-200">{unreadCount} unread</Badge>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <Check className="size-3.5 mr-1.5" /> Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              {loading ? "Loading…" : `${totalElements} messages`}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-8"></TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Quick contact</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!apiOk ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                      Please sign in as admin.
                    </TableCell>
                  </TableRow>
                ) : loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Inbox className="size-8 opacity-30" />
                        <span className="text-sm">No messages yet.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((m) => {
                    const isRead = readIds.has(m.id);
                    const isExpanded = expandedId === m.id;
                    return (
                      <TableRow
                        key={m.id}
                        className={`cursor-pointer transition-colors ${isRead ? "bg-background" : "bg-blue-50/40"} hover:bg-muted/20`}
                        onClick={() => handleRead(m.id)}
                      >
                        <TableCell className="pl-4 align-top pt-4">
                          {isRead ? (
                            <Eye className="size-3.5 text-muted-foreground/40" />
                          ) : (
                            <div className="size-2.5 rounded-full bg-blue-500 mt-1" aria-label="Unread" />
                          )}
                        </TableCell>
                        <TableCell className="align-top pt-4">
                          <div className={`text-sm ${isRead ? "font-medium" : "font-bold"}`}>{m.name}</div>
                          <Badge variant="outline" className="mt-1 text-[10px]">#{m.id}</Badge>
                        </TableCell>
                        <TableCell className="align-top pt-4 max-w-md">
                          <div className={`text-sm text-muted-foreground ${isExpanded ? "whitespace-pre-wrap" : "line-clamp-2"}`}>
                            {m.message}
                          </div>
                          {!isExpanded && m.message.length > 120 && (
                            <button className="text-[11px] text-primary hover:underline mt-0.5">Read more</button>
                          )}
                        </TableCell>
                        <TableCell className="align-top pt-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col gap-1">
                            {m.phone && (
                              <div className="flex items-center gap-2">
                                <a href={`tel:${m.phone}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                  <Phone className="size-3" /> {m.phone}
                                </a>
                                <a
                                  href={`https://wa.me/91${m.phone.replace(/\D/g,"").slice(-10)}?text=${encodeURIComponent("Hi " + m.name + ", thank you for contacting MangaloreHomes...")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] font-medium text-emerald-600 hover:underline"
                                >
                                  WhatsApp
                                </a>
                              </div>
                            )}
                            {m.email && (
                              <a href={`mailto:${m.email}?subject=Re: Your message to MangaloreHomes`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                                <Mail className="size-3" /> {m.email}
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="align-top pt-4 text-right text-xs text-muted-foreground">
                          <div>{timeAgo(m.createdAt)}</div>
                          <div className="text-muted-foreground/70">{new Date(m.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</div>
                        </TableCell>
                        <TableCell className="align-top pt-4" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            onClick={async () => {
                              const ok = await confirm.ask({
                                title: `Delete message #${m.id}?`,
                                body: `Message from "${m.name}" will be permanently removed.`,
                                confirmText: "Delete",
                                tone: "danger",
                              });
                              if (!ok) return;
                              try {
                                await apiFetch(`/api/admin/contact-messages/${m.id}`, { token: token ?? undefined, method: "DELETE" });
                                load();
                              } catch {}
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
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
              <div className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
