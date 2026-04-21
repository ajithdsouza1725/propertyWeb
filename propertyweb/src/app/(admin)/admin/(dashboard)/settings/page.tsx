"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { apiFetch } from "@/lib/api";
import { adminDashboardApiEnabled } from "@/lib/admin-dev";
import { useAccessToken } from "@/lib/use-access-token";
import { Globe, Phone, Mail, Shield, Share2, BarChart3, Clock, CheckCircle2 } from "lucide-react";

function str(v: unknown): string {
  if (v == null) return "";
  return String(v);
}

type FieldDef = {
  key: string;
  label: string;
  placeholder: string;
  type?: "text" | "textarea";
};

const SITE_FIELDS: FieldDef[] = [
  { key: "siteName", label: "Site name", placeholder: "MangaloreHomes" },
  { key: "siteTagline", label: "Tagline / description", placeholder: "Mangalore's trusted property portal" },
  { key: "logoUrl", label: "Logo URL", placeholder: "https://..." },
  { key: "faviconUrl", label: "Favicon URL", placeholder: "https://..." },
];

const CONTACT_FIELDS: FieldDef[] = [
  { key: "supportPhone", label: "Support phone", placeholder: "+91 98XX-XXX-XXX" },
  { key: "supportEmail", label: "Support email", placeholder: "support@mangalorehomes.in" },
  { key: "whatsapp", label: "WhatsApp number", placeholder: "+919876543210" },
  { key: "address", label: "Office address", placeholder: "Mangalore, Karnataka, India" },
  { key: "operatingHours", label: "Operating hours", placeholder: "Mon–Sat, 9 AM – 7 PM" },
];

const SOCIAL_FIELDS: FieldDef[] = [
  { key: "facebookUrl", label: "Facebook", placeholder: "https://facebook.com/..." },
  { key: "instagramUrl", label: "Instagram", placeholder: "https://instagram.com/..." },
  { key: "linkedinUrl", label: "LinkedIn", placeholder: "https://linkedin.com/..." },
];

const LEGAL_FIELDS: FieldDef[] = [
  { key: "reraNumber", label: "RERA registration number", placeholder: "PRM/KA/RERA/..." },
  { key: "gstNumber", label: "GST number", placeholder: "29AABCU..." },
  { key: "companyName", label: "Legal entity name", placeholder: "MangaloreHomes Pvt. Ltd." },
];

const ANALYTICS_FIELDS: FieldDef[] = [
  { key: "googleAnalyticsId", label: "Google Analytics ID (GA4)", placeholder: "G-XXXXXXXXXX" },
];

const SECTIONS = [
  { title: "Site identity", icon: Globe, fields: SITE_FIELDS },
  { title: "Contact & support", icon: Phone, fields: CONTACT_FIELDS },
  { title: "Social media", icon: Share2, fields: SOCIAL_FIELDS },
  { title: "Legal & compliance", icon: Shield, fields: LEGAL_FIELDS },
  { title: "Analytics & tracking", icon: BarChart3, fields: ANALYTICS_FIELDS },
];

export default function AdminSettingsPage() {
  const token = useAccessToken();
  const apiOk = adminDashboardApiEnabled(token);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    if (!apiOk) { setLoading(false); return; }
    apiFetch<Record<string, unknown>>("/api/admin/cms/settings", { token: token ?? undefined })
      .then((m) => {
        if (!mounted) return;
        const f: Record<string, string> = {};
        for (const s of SECTIONS) {
          for (const field of s.fields) {
            f[field.key] = str(m[field.key]);
          }
        }
        setForm(f);
      })
      .catch(() => { if (mounted) setError("Could not load settings."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [token, apiOk]);

  async function handleSave() {
    if (!apiOk || saving) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const body: Record<string, string> = {};
      for (const [k, v] of Object.entries(form)) {
        body[k] = v.trim();
      }
      await apiFetch("/api/admin/cms/settings", { token: token ?? undefined, method: "PUT", body });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Site identity, contact info, social links, legal details, and analytics.
          </p>
        </div>
        <Button disabled={saving || loading || !apiOk} onClick={handleSave} className="min-w-[120px]">
          {saving ? "Saving…" : saved ? <><CheckCircle2 className="size-4 mr-1.5" /> Saved</> : "Save all changes"}
        </Button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {SECTIONS.map((section) => {
        const Icon = section.icon;
        return (
          <Card key={section.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <Icon className="size-5 text-muted-foreground" />
                <h2 className="text-base font-bold">{section.title}</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {section.fields.map((field) => (
                  <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {field.label}
                    </label>
                    {field.type === "textarea" ? (
                      <Textarea
                        rows={3}
                        placeholder={field.placeholder}
                        value={form[field.key] ?? ""}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        disabled={loading || !apiOk}
                      />
                    ) : (
                      <Input
                        placeholder={field.placeholder}
                        value={form[field.key] ?? ""}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        disabled={loading || !apiOk}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex justify-end">
        <Button disabled={saving || loading || !apiOk} onClick={handleSave} className="min-w-[120px]">
          {saving ? "Saving…" : saved ? <><CheckCircle2 className="size-4 mr-1.5" /> Saved</> : "Save all changes"}
        </Button>
      </div>
    </div>
  );
}
