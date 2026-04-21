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

export default function AdminLocationsPage() {
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
    city: "Mangalore",
    name: "",
    slug: "",
    imageUrl: "",
    description: "",
    isFeatured: "no" as "yes" | "no",
    isActive: "yes" as "yes" | "no",
  });

  const canSave = useMemo(() => {
    if (!apiOk) return false;
    if (!form.city.trim()) return false;
    if (!form.name.trim()) return false;
    return true;
  }, [apiOk, form.city, form.name]);

  useEffect(() => {
    let mounted = true;
    if (!apiOk) {
      setLoading(false);
      setRows([]);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (active !== "any") params.set("active", active);
    apiFetch<any[]>(`/api/admin/locations${params.toString() ? `?${params.toString()}` : ""}`, {
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
    const r = await apiFetch<any[]>(`/api/admin/locations${params.toString() ? `?${params.toString()}` : ""}`, {
      token: token ?? undefined,
    });
    setRows(r);
  }

  return (
    <div className="space-y-6">
      {confirm.dialog}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">Manage locations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add/edit localities, slugs, and featured localities.
          </p>
        </div>
        <Button
          onClick={() => {
            setMode("create");
            setEditing(null);
            setForm({
              city: "Mangalore",
              name: "",
              slug: "",
              imageUrl: "",
              description: "",
              isFeatured: "no",
              isActive: "yes",
            });
            setDialogOpen(true);
          }}
        >
          Add locality
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Add locality" : "Edit locality"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
            />
            <Input
              placeholder="Locality name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
            <Input
              placeholder="Slug (optional, auto-generated if empty)"
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            />
            <Input
              placeholder="Image URL (optional)"
              value={form.imageUrl}
              onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
            />
            <Input
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select value={form.isFeatured} onValueChange={(v) => setForm((p) => ({ ...p, isFeatured: v as any }))}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Featured" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Not featured</SelectItem>
                  <SelectItem value="yes">Featured</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.isActive} onValueChange={(v) => setForm((p) => ({ ...p, isActive: v as any }))}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Active" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Active</SelectItem>
                  <SelectItem value="no">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                      city: form.city,
                      name: form.name,
                      slug: form.slug || null,
                      imageUrl: form.imageUrl || null,
                      description: form.description || null,
                      isFeatured: form.isFeatured === "yes",
                      isActive: form.isActive === "yes",
                    };
                    if (mode === "create") {
                      await apiFetch("/api/admin/locations", {
                        token: token ?? undefined,
                        method: "POST",
                        body,
                      });
                    } else if (editing) {
                      await apiFetch(`/api/admin/locations/${editing.id}`, {
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-sm flex-1">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, slug, city…" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
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
          </div>

          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!apiOk ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      Please login as admin.
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
                      No locations yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.name}</TableCell>
                      <TableCell className="text-muted-foreground">{l.slug}</TableCell>
                      <TableCell className="text-muted-foreground">{l.city}</TableCell>
                      <TableCell className="text-muted-foreground">{l.isFeatured ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-muted-foreground">{l.isActive ? "Active" : "Disabled"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setMode("edit");
                              setEditing(l);
                              setForm({
                                city: l.city ?? "Mangalore",
                                name: l.name ?? "",
                                slug: l.slug ?? "",
                                imageUrl: l.imageUrl ?? "",
                                description: l.description ?? "",
                                isFeatured: l.isFeatured ? "yes" : "no",
                                isActive: l.isActive ? "yes" : "no",
                              });
                              setDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={deletingId === l.id || !l.isActive}
                            onClick={async () => {
                              if (!apiOk) return;
                              const ok = await confirm.ask({
                                title: `Disable ${l.name}?`,
                                body: "New listings won't be able to pick this locality. Existing listings stay visible. You can re-enable later by editing the row.",
                                confirmText: "Disable locality",
                                tone: "danger",
                              });
                              if (!ok) return;
                              setDeletingId(l.id);
                              try {
                                await apiFetch(`/api/admin/locations/${l.id}`, {
                                  token: token ?? undefined,
                                  method: "DELETE",
                                });
                                setRows((prev) => prev.map((x) => (x.id === l.id ? { ...x, isActive: false } : x)));
                              } finally {
                                setDeletingId(null);
                              }
                            }}
                          >
                            {deletingId === l.id ? "Disabling…" : l.isActive ? "Disable" : "Disabled"}
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

