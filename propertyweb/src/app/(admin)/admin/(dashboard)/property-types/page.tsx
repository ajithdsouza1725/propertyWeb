"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { apiFetch } from "@/lib/api";

import { adminDashboardApiEnabled } from "@/lib/admin-dev";
import { useAccessToken } from "@/lib/use-access-token";

export default function AdminPropertyTypesPage() {
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
    slug: "",
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
    apiFetch<any[]>(`/api/admin/property-types${params.toString() ? `?${params.toString()}` : ""}`, {
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
    const r = await apiFetch<any[]>(`/api/admin/property-types${params.toString() ? `?${params.toString()}` : ""}`, {
      token: token ?? undefined,
    });
    setRows(r);
  }

  return (
    <div className="space-y-6">
      {confirm.dialog}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manage property types</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Control types shown in filters and SEO pages.
          </p>
        </div>
        <Button
          onClick={() => {
            setMode("create");
            setEditing(null);
            setForm({ name: "", slug: "", isActive: "yes" });
            setDialogOpen(true);
          }}
        >
          Add type
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Add property type" : "Edit property type"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              placeholder="Name (e.g. Residential)"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
            <Input
              placeholder="Slug (optional, auto-generated if empty)"
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
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
                      slug: form.slug || null,
                      isActive: form.isActive === "yes",
                    };
                    if (mode === "create") {
                      await apiFetch("/api/admin/property-types", {
                        token: token ?? undefined,
                        method: "POST",
                        body,
                      });
                    } else if (editing) {
                      await apiFetch(`/api/admin/property-types/${editing.id}`, {
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
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or slug…" />
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
                  <TableHead>Slug</TableHead>
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
                      No property types yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell className="text-muted-foreground">{t.slug}</TableCell>
                      <TableCell className="text-muted-foreground">{t.isActive ? "Active" : "Disabled"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setMode("edit");
                              setEditing(t);
                              setForm({ name: t.name ?? "", slug: t.slug ?? "", isActive: t.isActive ? "yes" : "no" });
                              setDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={deletingId === t.id || !t.isActive}
                            onClick={async () => {
                              if (!apiOk) return;
                              const ok = await confirm.ask({
                                title: `Disable "${t.name}"?`,
                                body: "Sellers won't be able to select this property type for new listings. Existing listings stay visible.",
                                confirmText: "Disable type",
                                tone: "danger",
                              });
                              if (!ok) return;
                              setDeletingId(t.id);
                              try {
                                await apiFetch(`/api/admin/property-types/${t.id}`, {
                                  token: token ?? undefined,
                                  method: "DELETE",
                                });
                                setRows((prev) => prev.map((x) => (x.id === t.id ? { ...x, isActive: false } : x)));
                              } finally {
                                setDeletingId(null);
                              }
                            }}
                          >
                            {deletingId === t.id ? "Disabling…" : t.isActive ? "Disable" : "Disabled"}
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

