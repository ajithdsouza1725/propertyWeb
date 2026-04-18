"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

import { adminDashboardApiEnabled } from "@/lib/admin-dev";
import { useAccessToken } from "@/lib/use-access-token";

function str(v: unknown): string {
  if (v == null) return "";
  return String(v);
}

export default function AdminSettingsPage() {
  const token = useAccessToken();
  const apiOk = adminDashboardApiEnabled(token);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [siteName, setSiteName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    let mounted = true;
    if (!apiOk) {
      setLoading(false);
      return;
    }
    apiFetch<Record<string, unknown>>("/api/admin/cms/settings", { token: token ?? undefined })
      .then((m) => {
        if (!mounted) return;
        setSiteName(str(m.siteName));
        setLogoUrl(str(m.logoUrl));
        setFaviconUrl(str(m.faviconUrl));
        setSupportPhone(str(m.supportPhone));
        setSupportEmail(str(m.supportEmail));
        setWhatsapp(str(m.whatsapp));
      })
      .catch(() => {
        if (!mounted) return;
        setError("Could not load settings.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [token, apiOk]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Site identity and support contact details.</p>
      </div>

      {!apiOk ? (
        <div className="text-sm text-muted-foreground">Please sign in as admin.</div>
      ) : null}
      {error ? <div className="rounded-xl border bg-muted/30 p-3 text-sm">{error}</div> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-muted/60">
          <CardHeader>
            <CardTitle className="text-base">Site</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Input
              placeholder="Site name"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              disabled={loading || !apiOk}
            />
            <Input
              placeholder="Logo URL"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              disabled={loading || !apiOk}
            />
            <Input
              placeholder="Favicon URL"
              value={faviconUrl}
              onChange={(e) => setFaviconUrl(e.target.value)}
              disabled={loading || !apiOk}
            />
          </CardContent>
        </Card>

        <Card className="border-muted/60">
          <CardHeader>
            <CardTitle className="text-base">Support</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Input
              placeholder="Contact number"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              disabled={loading || !apiOk}
            />
            <Input
              placeholder="Support email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              disabled={loading || !apiOk}
            />
            <Input
              placeholder="WhatsApp number"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              disabled={loading || !apiOk}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          disabled={saving || loading || !apiOk}
          onClick={async () => {
            if (!apiOk) return;
            setSaving(true);
            setError(null);
            try {
              await apiFetch<Record<string, unknown>>("/api/admin/cms/settings", {
                token: token ?? undefined,
                method: "PUT",
                body: {
                  siteName: siteName.trim(),
                  logoUrl: logoUrl.trim(),
                  faviconUrl: faviconUrl.trim(),
                  supportPhone: supportPhone.trim(),
                  supportEmail: supportEmail.trim(),
                  whatsapp: whatsapp.trim(),
                },
              });
            } catch (e: unknown) {
              const err = e as { message?: string };
              setError(err?.message ?? "Save failed");
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
