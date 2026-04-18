"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { apiFetch } from "@/lib/api";

import { adminDashboardApiEnabled } from "@/lib/admin-dev";
import { useAccessToken } from "@/lib/use-access-token";

export default function AdminAmenitiesPage() {
  const token = useAccessToken();
  const apiOk = adminDashboardApiEnabled(token);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string>("any");

  const confirm = useConfirm();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    icon: "",
    isActive: "yes" as "yes" | "no",
  });

  const canSave = useMemo(() => {
    if (!apiOk) return false;
    if (!form.name.trim()) return false;
    return true;
  }, [apiOk, form.name]);

  useEffect(() => {
    let mounted = true;
    if (!apiOk) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (active !== "any") params.set("active", active);
    apiFetch<any[]>(`/api/admin/amenities${params.toString() ? `?${params.toString()}` : ""}`, {
      token: token ?? undefined,
    })
      .then((r) => {
        if (!mounted) return;
        setRows(r);
      })
      .catch(() => {
        if (!mounted) return;
        setRows([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [token, q, active, apiOk]);

  async function refresh() {
    if (!apiOk) return;
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (active !== "any") params.set("active", active);
    const r = await apiFetch<any[]>(`/api/admin/amenities${params.toString() ? `?${params.toString()}` : ""}`, {
      token: token ?? undefined,
    });
    setRows(r);
  }

  return (
    <div className="space-y-6">
      {confirm.dialog}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Manage amenities</h1>
        <Button
          onClick={() => {
            setMode("create");
            setEditing(null);
            setForm({ name: "", icon: "", isActive: "yes" });
            setDialogOpen(true);
          }}
        >
          Add amenity
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Add amenity" : "Edit amenity"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              placeholder="Amenity name (e.g. CCTV)"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
            <Input
              placeholder="Icon key (optional)"
              value={form.icon}
              onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
            />
            <Select value={form.isActive} onValueChange={(v) => setForm((p) => ({ ...p, isActive: v as any }))}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Active" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Active</SelectItem>
                <SelectItem value="no">Disabled</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button
                disabled={!canSave || saving}
                onClick={async () => {
                  if (!apiOk) return;
                  setSaving(true);
                  try {
                    const body = {
                      name: form.name,
                      icon: form.icon || null,
                      isActive: form.isActive === "yes",
                    };
                    if (mode === "create") {
                      await apiFetch("/api/admin/amenities", {
                        token: token ?? undefined,
                        method: "POST",
                        body,
                      });
                    } else if (editing) {
                      await apiFetch(`/api/admin/amenities/${editing.id}`, {
                        token: token ?? undefined,
                        method: "PUT",
                        body,
                      });
                    }
                    setDialogOpen(false);
                    await refresh();
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="border-muted/60">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="max-w-sm flex-1">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or icon…" />
            </div>
            <div className="w-[180px]">
              <Select value={active} onValueChange={setActive}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Active" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">All</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">{loading ? "Loading…" : `${rows.length} results`}</div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!apiOk ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                      Please login as admin.
                    </TableCell>
                  </TableRow>
                ) : loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                      No amenities yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell className="text-muted-foreground">{a.icon ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{a.isActive ? "Active" : "Disabled"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setMode("edit");
                              setEditing(a);
                              setForm({ name: a.name ?? "", icon: a.icon ?? "", isActive: a.isActive ? "yes" : "no" });
                              setDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={deletingId === a.id || !a.isActive}
                            onClick={async () => {
                              if (!apiOk) return;
                              const ok = await confirm.ask({
                                title: `Disable "${a.name}"?`,
                                body: "Sellers won't see this amenity when creating new listings. Existing listings keep it.",
                                confirmText: "Disable amenity",
                                tone: "danger",
                              });
                              if (!ok) return;
                              setDeletingId(a.id);
                              try {
                                await apiFetch(`/api/admin/amenities/${a.id}`, {
                                  token: token ?? undefined,
                                  method: "DELETE",
                                });
                                setRows((prev) => prev.map((x) => (x.id === a.id ? { ...x, isActive: false } : x)));
                              } finally {
                                setDeletingId(null);
                              }
                            }}
                          >
                            {deletingId === a.id ? "Disabling…" : a.isActive ? "Disable" : "Disabled"}
                          </Button>
                        </div>
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
  );
}

