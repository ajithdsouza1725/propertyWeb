"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { apiFetch, mediaAbsoluteUrl } from "@/lib/api";
import { adminDashboardApiEnabled } from "@/lib/admin-dev";
import { useAccessToken } from "@/lib/use-access-token";
import { UserPlus, Phone, Mail, Building2, Users, ShoppingBag, Briefcase, Shield } from "lucide-react";

type AdminUser = {
  id: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  businessName: string | null;
  profileImage?: string | null;
  role: "buyer" | "owner" | "agent" | "admin";
  status: "active" | "blocked" | "pending";
  isVerified: boolean;
  createdAt?: string;
};

function roleBadge(role: string) {
  switch (role) {
    case "buyer":
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100"><ShoppingBag className="size-3 mr-1" />Buyer</Badge>;
    case "owner":
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"><Building2 className="size-3 mr-1" />Owner</Badge>;
    case "agent":
      return <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100"><Briefcase className="size-3 mr-1" />Agent</Badge>;
    case "admin":
      return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100"><Shield className="size-3 mr-1" />Admin</Badge>;
    default:
      return <Badge variant="outline" className="capitalize">{role}</Badge>;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Active</Badge>;
    case "blocked":
      return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">Blocked</Badge>;
    default:
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">Pending</Badge>;
  }
}

function emptyCreate() {
  return {
    fullName: "", email: "", phone: "", businessName: "", profileImage: "",
    role: "buyer" as AdminUser["role"], status: "active" as AdminUser["status"],
    isVerified: "no" as "yes" | "no", password: "",
  };
}

function UserTable({
  rows, loading, apiReady, onEdit, onBlock,
}: {
  rows: AdminUser[];
  loading: boolean;
  apiReady: boolean;
  onEdit: (u: AdminUser) => void;
  onBlock: (u: AdminUser) => void;
}) {
  return (
    <div className="rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>User</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!apiReady ? (
            <TableRow>
              <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                Please login as admin.
              </TableCell>
            </TableRow>
          ) : loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted/60" /></TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-12 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Users className="size-8 opacity-30" />
                  <span className="text-sm">No users found.</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((u) => (
              <TableRow key={u.id} className="hover:bg-muted/10">
                <TableCell>
                  <div className="flex items-center gap-3">
                    {u.profileImage ? (
                      <img
                        src={mediaAbsoluteUrl(u.profileImage)}
                        alt=""
                        className="size-9 rounded-full border object-cover shrink-0"
                      />
                    ) : (
                      <div className="size-9 rounded-full border bg-muted/40 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-muted-foreground">
                          {(u.fullName ?? "?")[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-sm">{u.fullName}</div>
                      {u.businessName && (
                        <div className="text-xs text-muted-foreground">{u.businessName}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {u.email && (
                    <a href={`mailto:${u.email}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      <Mail className="size-3" /> {u.email}
                    </a>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    {u.phone && (
                      <a href={`tel:${u.phone}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                        <Phone className="size-3" /> {u.phone}
                      </a>
                    )}
                    {u.phone && (
                      <a
                        href={`https://wa.me/91${u.phone.replace(/\D/g,"").slice(-10)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-emerald-600 hover:underline"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                  {/* Property + enquiry counts */}
                  <div className="flex items-center gap-2 mt-1">
                    {(u as any).propertyCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">
                        <Building2 className="size-2.5" />{(u as any).propertyCount} listings
                      </span>
                    )}
                    {(u as any).enquiryCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                        {(u as any).enquiryCount} enquiries
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{roleBadge(u.role)}</TableCell>
                <TableCell>{statusBadge(u.status)}</TableCell>
                <TableCell>
                  {u.isVerified ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Verified</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Unverified</Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(u)}>Edit</Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={u.status === "blocked" ? "" : "border-red-200 text-red-700 hover:bg-red-50"}
                      disabled={u.status === "blocked"}
                      onClick={() => onBlock(u)}
                    >
                      {u.status === "blocked" ? "Blocked" : "Block"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AdminUsersPage() {
  const token = useAccessToken();
  const apiOk = adminDashboardApiEnabled(token);
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("any");
  const [tab, setTab] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(() => emptyCreate());
  const [saving, setSaving] = useState(false);
  const [blockingId, setBlockingId] = useState<number | null>(null);
  const confirm = useConfirm();

  const canSave = useMemo(() => {
    if (!apiOk) return false;
    if (!form.fullName.trim()) return false;
    if (mode === "create" && !form.password.trim()) return false;
    if (!form.email.trim() && !form.phone.trim()) return false;
    return true;
  }, [apiOk, form, mode]);

  const loadUsers = async () => {
    if (!apiOk) { setRows([]); setLoading(false); return; }
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status !== "any") params.set("status", status);
    try {
      const r = await apiFetch<AdminUser[]>(`/api/admin/users${params.toString() ? `?${params.toString()}` : ""}`, {
        token: token ?? undefined,
      });
      setRows(r);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, [token, q, status, apiOk]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    if (tab === "all") return rows;
    return rows.filter((u) => {
      if (tab === "buyers") return u.role === "buyer";
      if (tab === "sellers") return u.role === "owner" || u.role === "agent";
      if (tab === "admins") return u.role === "admin";
      return true;
    });
  }, [rows, tab]);

  const counts = useMemo(() => ({
    all: rows.length,
    buyers: rows.filter((u) => u.role === "buyer").length,
    sellers: rows.filter((u) => u.role === "owner" || u.role === "agent").length,
    admins: rows.filter((u) => u.role === "admin").length,
  }), [rows]);

  const openEdit = (u: AdminUser) => {
    setMode("edit");
    setEditing(u);
    setForm({
      fullName: u.fullName ?? "", email: u.email ?? "", phone: u.phone ?? "",
      businessName: u.businessName ?? "", profileImage: u.profileImage ?? "",
      role: u.role, status: u.status, isVerified: u.isVerified ? "yes" : "no", password: "",
    });
    setDialogOpen(true);
  };

  const handleBlock = async (u: AdminUser) => {
    if (!apiOk) return;
    const ok = await confirm.ask({
      title: `Block ${u.fullName || "this user"}?`,
      body: (
        <>
          They won&apos;t be able to sign in. Existing listings stay visible — you can
          unblock later from the Edit dialog.
        </>
      ),
      confirmText: "Block user",
      tone: "danger",
    });
    if (!ok) return;
    setBlockingId(u.id);
    try {
      await apiFetch(`/api/admin/users/${u.id}`, { token: token ?? undefined, method: "DELETE" });
      setRows((prev) => prev.map((x) => x.id === u.id ? { ...x, status: "blocked" } : x));
    } finally {
      setBlockingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {confirm.dialog}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create, verify, block/unblock buyers, sellers and agents.</p>
        </div>
        <Button onClick={() => { setMode("create"); setEditing(null); setForm(emptyCreate()); setDialogOpen(true); }}>
          <UserPlus className="size-4 mr-2" /> Create User
        </Button>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Create New User" : "Edit User"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input placeholder="Full name *" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <Input placeholder="Business name (optional)" value={form.businessName} onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))} />
            <div className="grid grid-cols-3 gap-3">
              <Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v as any }))}>
                <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as any }))}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.isVerified} onValueChange={(v) => setForm((p) => ({ ...p, isVerified: v as any }))}>
                <SelectTrigger><SelectValue placeholder="Verified" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Verified</SelectItem>
                  <SelectItem value="no">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder={mode === "create" ? "Password *" : "New password (leave blank to keep)"}
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
              <Button
                disabled={!canSave || saving}
                onClick={async () => {
                  if (!apiOk) return;
                  setSaving(true);
                  try {
                    if (mode === "create") {
                      await apiFetch("/api/admin/users", {
                        token: token ?? undefined,
                        method: "POST",
                        body: {
                          fullName: form.fullName, email: form.email || null, phone: form.phone || null,
                          businessName: form.businessName || null, profileImage: form.profileImage.trim() || null,
                          role: form.role, status: form.status, isVerified: form.isVerified === "yes", password: form.password,
                        },
                      });
                    } else if (editing) {
                      await apiFetch(`/api/admin/users/${editing.id}`, {
                        token: token ?? undefined,
                        method: "PUT",
                        body: {
                          fullName: form.fullName || null, email: form.email || null, phone: form.phone || null,
                          businessName: form.businessName || null, profileImage: form.profileImage.trim() || null,
                          role: form.role, status: form.status, isVerified: form.isVerified === "yes",
                          password: form.password || null,
                        },
                      });
                    }
                    setDialogOpen(false);
                    await loadUsers();
                  } finally { setSaving(false); }
                }}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-5">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone…" className="max-w-sm" />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{loading ? "Loading…" : `${filtered.length} users`}</span>
          </div>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="h-10">
              {[
                { key: "all", label: "All Users", count: counts.all },
                { key: "buyers", label: "Buyers", count: counts.buyers },
                { key: "sellers", label: "Sellers & Agents", count: counts.sellers },
                { key: "admins", label: "Admins", count: counts.admins },
              ].map((t) => (
                <TabsTrigger key={t.key} value={t.key} className="flex items-center gap-1.5 px-4">
                  {t.label}
                  <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">{t.count}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={tab} className="mt-4">
              <UserTable
                rows={filtered}
                loading={loading}
                apiReady={apiOk}
                onEdit={openEdit}
                onBlock={handleBlock}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
