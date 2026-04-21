"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { adminDashboardApiEnabled } from "@/lib/admin-dev";
import { useAccessToken } from "@/lib/use-access-token";
import { Globe, Plus, CheckCircle2 } from "lucide-react";

function str(v: unknown): string {
  if (v == null) return "";
  return String(v);
}

const DEFAULT_PAGES = ["homepage", "buy", "rent", "sell", "locality", "property_type", "contact", "about"];

export default function AdminSeoPage() {
  const token = useAccessToken();
  const apiOk = adminDashboardApiEnabled(token);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pageKey, setPageKey] = useState("homepage");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [schemaJson, setSchemaJson] = useState("");
  const [customPageKey, setCustomPageKey] = useState("");
  const [pageKeys, setPageKeys] = useState<string[]>(DEFAULT_PAGES);

  // Load the global SEO defaults
  useEffect(() => {
    let mounted = true;
    if (!apiOk) { setLoading(false); return; }
    Promise.all([
      apiFetch<Record<string, unknown>>("/api/admin/cms/seo", { token: token ?? undefined }),
      apiFetch<any[]>("/api/admin/seo-pages", { token: token ?? undefined }).catch(() => []),
    ]).then(([m, pages]) => {
      if (!mounted) return;
      setPageKey(str(m.pageKey) || "homepage");
      setTitle(str(m.title));
      setDescription(str(m.description));
      setOgImageUrl(str(m.ogImageUrl));
      setSchemaJson(str(m.schemaJson));
      // Merge existing page keys with defaults
      if (Array.isArray(pages)) {
        const existing = pages.map((p: any) => p.pageKey ?? p.key).filter(Boolean);
        const merged = [...new Set([...DEFAULT_PAGES, ...existing])];
        setPageKeys(merged);
      }
    })
    .catch(() => { if (mounted) setError("Could not load SEO settings."); })
    .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [token, apiOk]);

  // Load per-page SEO when pageKey changes
  useEffect(() => {
    if (!apiOk || !pageKey || loading) return;
    apiFetch<Record<string, unknown>>(`/api/admin/seo-pages/${encodeURIComponent(pageKey)}`, { token: token ?? undefined })
      .then((m) => {
        setTitle(str(m.pageTitle ?? m.title));
        setDescription(str(m.metaDescription ?? m.description));
        setOgImageUrl(str(m.ogImage ?? m.ogImageUrl));
        setSchemaJson(str(m.schemaJson));
      })
      .catch(() => {
        // New page — clear fields
        setTitle("");
        setDescription("");
        setOgImageUrl("");
        setSchemaJson("");
      });
  }, [pageKey, apiOk, token, loading]);

  async function handleSave() {
    if (!apiOk || saving) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      // Save to per-page SEO endpoint
      await apiFetch(`/api/admin/seo-pages/${encodeURIComponent(pageKey)}`, {
        token: token ?? undefined,
        method: "PUT",
        body: {
          pageTitle: title.trim(),
          metaTitle: title.trim(),
          metaDescription: description.trim(),
          ogImage: ogImageUrl.trim(),
          schemaJson: schemaJson.trim(),
        },
      });
      // Also save to global SEO if homepage
      if (pageKey === "homepage") {
        await apiFetch("/api/admin/cms/seo", {
          token: token ?? undefined,
          method: "PUT",
          body: {
            pageKey,
            title: title.trim(),
            description: description.trim(),
            ogImageUrl: ogImageUrl.trim(),
            schemaJson: schemaJson.trim(),
          },
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function addCustomPage() {
    const key = customPageKey.trim().toLowerCase().replace(/\s+/g, "-");
    if (!key || pageKeys.includes(key)) return;
    setPageKeys((prev) => [...prev, key]);
    setPageKey(key);
    setCustomPageKey("");
    setTitle("");
    setDescription("");
    setOgImageUrl("");
    setSchemaJson("");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">SEO management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure meta title, description, OG image, and schema markup per page.
          </p>
        </div>
        <Button disabled={saving || loading || !apiOk} onClick={handleSave}>
          {saving ? "Saving…" : saved ? <><CheckCircle2 className="size-4 mr-1.5" /> Saved</> : "Save changes"}
        </Button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Page selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="size-5 text-muted-foreground" />
            <h2 className="text-base font-bold">Select page</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={pageKey} onValueChange={setPageKey} disabled={loading || !apiOk}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select page" />
              </SelectTrigger>
              <SelectContent>
                {pageKeys.map((k) => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Input
                placeholder="New page key (e.g. blog)"
                value={customPageKey}
                onChange={(e) => setCustomPageKey(e.target.value)}
                className="w-48"
                disabled={!apiOk}
                onKeyDown={(e) => e.key === "Enter" && addCustomPage()}
              />
              <Button variant="outline" size="sm" onClick={addCustomPage} disabled={!customPageKey.trim()}>
                <Plus className="size-4 mr-1" /> Add page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO fields */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-base font-bold mb-5">SEO for: <span className="text-primary">{pageKey}</span></h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Meta title
              </label>
              <Input
                placeholder="MangaloreHomes — Buy Property in Mangalore"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading || !apiOk}
              />
              <p className="mt-1 text-[11px] text-muted-foreground">{title.length}/60 characters (recommended: 50–60)</p>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Meta description
              </label>
              <Textarea
                placeholder="Discover verified properties across Kadri, Bejai..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={loading || !apiOk}
              />
              <p className="mt-1 text-[11px] text-muted-foreground">{description.length}/160 characters (recommended: 120–160)</p>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                OG image URL
              </label>
              <Input
                placeholder="https://..."
                value={ogImageUrl}
                onChange={(e) => setOgImageUrl(e.target.value)}
                disabled={loading || !apiOk}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Structured data (JSON-LD)
              </label>
              <Textarea
                placeholder='{"@context":"https://schema.org",...}'
                value={schemaJson}
                onChange={(e) => setSchemaJson(e.target.value)}
                rows={4}
                disabled={loading || !apiOk}
                className="font-mono text-xs"
              />
            </div>
          </div>

          {/* Live preview */}
          <div className="mt-6 rounded-xl border bg-muted/30 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Google preview</p>
            <div className="max-w-lg">
              <div className="text-lg text-blue-700 font-medium leading-snug truncate">
                {title || "Page Title"}
              </div>
              <div className="text-sm text-emerald-700 truncate mt-0.5">
                mangalorehomes.in/{pageKey === "homepage" ? "" : pageKey}
              </div>
              <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                {description || "Meta description will appear here..."}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button disabled={saving || loading || !apiOk} onClick={handleSave}>
          {saving ? "Saving…" : saved ? <><CheckCircle2 className="size-4 mr-1.5" /> Saved</> : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
