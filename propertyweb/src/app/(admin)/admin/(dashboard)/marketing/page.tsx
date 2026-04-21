"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";

import { adminDashboardApiEnabled } from "@/lib/admin-dev";
import { useAccessToken } from "@/lib/use-access-token";

export default function AdminMarketingPage() {
  const token = useAccessToken();
  const apiOk = adminDashboardApiEnabled(token);
  const [banners, setBanners] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [seoRows, setSeoRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!apiOk) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [b, t, s] = await Promise.all([
        apiFetch<any[]>("/api/admin/banners", { token: token ?? undefined }),
        apiFetch<any[]>("/api/admin/testimonials", { token: token ?? undefined }),
        apiFetch<any[]>("/api/admin/seo-pages", { token: token ?? undefined }),
      ]);
      setBanners(b);
      setTestimonials(t);
      setSeoRows(s);
    } catch {
      setBanners([]);
      setTestimonials([]);
      setSeoRows([]);
    } finally {
      setLoading(false);
    }
  }, [token, apiOk]);

  useEffect(() => {
    load();
  }, [load]);

  const [bannerForm, setBannerForm] = useState<any>({});
  const [bannerOpen, setBannerOpen] = useState(false);
  const [testForm, setTestForm] = useState<any>({});
  const [testOpen, setTestOpen] = useState(false);
  const [seoForm, setSeoForm] = useState<any>({});
  const [seoOpen, setSeoOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!apiOk) return <div className="text-sm text-muted-foreground">Login as admin.</div>;
  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black tracking-tight md:text-3xl">Marketing content</h1>
      <p className="text-sm text-muted-foreground">Banners, testimonials, and per-page SEO (database).</p>

      <Tabs defaultValue="banners">
        <TabsList>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="seo">SEO pages</TabsTrigger>
        </TabsList>

        <TabsContent value="banners" className="mt-4 space-y-4">
          <Button
            onClick={() => {
              setBannerForm({ title: "", subtitle: "", imageUrl: "", buttonText: "", buttonLink: "", pageType: "homepage", active: true });
              setBannerOpen(true);
            }}
          >
            Add banner
          </Button>
          <Card className="border-muted/60">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{b.pageType}</TableCell>
                      <TableCell>{b.title ?? "—"}</TableCell>
                      <TableCell>{b.active ? "yes" : "no"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setBannerForm({ ...b, active: b.active });
                            setBannerOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="mt-4 space-y-4">
          <Button
            onClick={() => {
              setTestForm({ name: "", designation: "", comment: "", imageUrl: "", sortOrder: 0, active: true });
              setTestOpen(true);
            }}
          >
            Add testimonial
          </Button>
          <Card className="border-muted/60">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testimonials.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.name}</TableCell>
                      <TableCell>{t.active ? "yes" : "no"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setTestForm({ ...t });
                            setTestOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="mt-4 space-y-4">
          <Card className="border-muted/60">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Meta title</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seoRows.map((s) => (
                    <TableRow key={s.pageKey}>
                      <TableCell className="font-mono text-xs">{s.pageKey}</TableCell>
                      <TableCell>{s.metaTitle ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSeoForm({ ...s });
                            setSeoOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">
            New keys: use Edit on an existing row pattern or call API PUT /api/admin/seo-pages/{"{key}"} with JSON body.
          </p>
        </TabsContent>
      </Tabs>

      <Dialog open={bannerOpen} onOpenChange={setBannerOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Banner</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Input placeholder="Title" value={bannerForm.title ?? ""} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} />
            <Input placeholder="Subtitle" value={bannerForm.subtitle ?? ""} onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })} />
            <Input placeholder="Image URL" value={bannerForm.imageUrl ?? ""} onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })} />
            <Input placeholder="Button text" value={bannerForm.buttonText ?? ""} onChange={(e) => setBannerForm({ ...bannerForm, buttonText: e.target.value })} />
            <Input placeholder="Button link" value={bannerForm.buttonLink ?? ""} onChange={(e) => setBannerForm({ ...bannerForm, buttonLink: e.target.value })} />
            <Input placeholder="Page type (homepage)" value={bannerForm.pageType ?? "homepage"} onChange={(e) => setBannerForm({ ...bannerForm, pageType: e.target.value })} />
            <Select
              value={bannerForm.active ? "yes" : "no"}
              onValueChange={(v) => setBannerForm({ ...bannerForm, active: v === "yes" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Active</SelectItem>
                <SelectItem value="no">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {saveError && <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{saveError}</div>}
            <Button
              disabled={saving || !apiOk}
              onClick={async () => {
                if (!apiOk || saving) return;
                setSaving(true);
                setSaveError(null);
                try {
                  const body = {
                    title: bannerForm.title || null,
                    subtitle: bannerForm.subtitle || null,
                    imageUrl: bannerForm.imageUrl || null,
                    buttonText: bannerForm.buttonText || null,
                    buttonLink: bannerForm.buttonLink || null,
                    pageType: bannerForm.pageType || "homepage",
                    active: bannerForm.active !== false,
                  };
                  if (bannerForm.id) {
                    await apiFetch(`/api/admin/banners/${bannerForm.id}`, { token: token ?? undefined, method: "PUT", body });
                  } else {
                    await apiFetch("/api/admin/banners", { token: token ?? undefined, method: "POST", body });
                  }
                  setBannerOpen(false);
                  load();
                } catch { setSaveError("Failed to save banner."); }
                finally { setSaving(false); }
              }}
            >
              {saving ? "Saving…" : "Save banner"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={testOpen} onOpenChange={setTestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Testimonial</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Input placeholder="Name" value={testForm.name ?? ""} onChange={(e) => setTestForm({ ...testForm, name: e.target.value })} />
            <Input placeholder="Designation" value={testForm.designation ?? ""} onChange={(e) => setTestForm({ ...testForm, designation: e.target.value })} />
            <Textarea placeholder="Comment" value={testForm.comment ?? ""} onChange={(e) => setTestForm({ ...testForm, comment: e.target.value })} />
            <Input placeholder="Image URL" value={testForm.imageUrl ?? ""} onChange={(e) => setTestForm({ ...testForm, imageUrl: e.target.value })} />
            <Input
              placeholder="Sort order"
              inputMode="numeric"
              value={String(testForm.sortOrder ?? 0)}
              onChange={(e) => setTestForm({ ...testForm, sortOrder: Number(e.target.value) || 0 })}
            />
            <Select
              value={testForm.active ? "yes" : "no"}
              onValueChange={(v) => setTestForm({ ...testForm, active: v === "yes" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Active</SelectItem>
                <SelectItem value="no">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {saveError && <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{saveError}</div>}
            <Button
              disabled={saving || !apiOk}
              onClick={async () => {
                if (!apiOk || saving) return;
                setSaving(true);
                setSaveError(null);
                try {
                  const body = {
                    name: testForm.name,
                    designation: testForm.designation || null,
                    comment: testForm.comment,
                    imageUrl: testForm.imageUrl || null,
                    sortOrder: testForm.sortOrder ?? 0,
                    active: testForm.active !== false,
                  };
                  if (testForm.id) {
                    await apiFetch(`/api/admin/testimonials/${testForm.id}`, { token: token ?? undefined, method: "PUT", body });
                  } else {
                    await apiFetch("/api/admin/testimonials", { token: token ?? undefined, method: "POST", body });
                  }
                  setTestOpen(false);
                  load();
                } catch { setSaveError("Failed to save testimonial."); }
                finally { setSaving(false); }
              }}
            >
              {saving ? "Saving…" : "Save testimonial"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={seoOpen} onOpenChange={setSeoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>SEO — {seoForm.pageKey}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Input placeholder="Page title" value={seoForm.pageTitle ?? ""} onChange={(e) => setSeoForm({ ...seoForm, pageTitle: e.target.value })} />
            <Input placeholder="Meta title" value={seoForm.metaTitle ?? ""} onChange={(e) => setSeoForm({ ...seoForm, metaTitle: e.target.value })} />
            <Textarea placeholder="Meta description" value={seoForm.metaDescription ?? ""} onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })} />
            <Input placeholder="OG image URL" value={seoForm.ogImage ?? ""} onChange={(e) => setSeoForm({ ...seoForm, ogImage: e.target.value })} />
            {saveError && <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{saveError}</div>}
            <Button
              disabled={saving || !apiOk || !seoForm.pageKey}
              onClick={async () => {
                if (!apiOk || !seoForm.pageKey || saving) return;
                setSaving(true);
                setSaveError(null);
                try {
                  await apiFetch(`/api/admin/seo-pages/${encodeURIComponent(seoForm.pageKey)}`, {
                    token: token ?? undefined,
                    method: "PUT",
                    body: {
                      pageTitle: seoForm.pageTitle || null,
                      metaTitle: seoForm.metaTitle || null,
                      metaDescription: seoForm.metaDescription || null,
                      ogImage: seoForm.ogImage || null,
                    },
                  });
                  setSeoOpen(false);
                  load();
                } catch { setSaveError("Failed to save SEO settings."); }
                finally { setSaving(false); }
              }}
            >
              {saving ? "Saving…" : "Save SEO"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
