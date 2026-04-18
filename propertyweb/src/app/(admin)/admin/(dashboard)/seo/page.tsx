"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";

import { adminDashboardApiEnabled } from "@/lib/admin-dev";
import { useAccessToken } from "@/lib/use-access-token";

function str(v: unknown): string {
  if (v == null) return "";
  return String(v);
}

export default function AdminSeoPage() {
  const token = useAccessToken();
  const apiOk = adminDashboardApiEnabled(token);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageKey, setPageKey] = useState("homepage");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [schemaJson, setSchemaJson] = useState("");

  useEffect(() => {
    let mounted = true;
    if (!apiOk) {
      setLoading(false);
      return;
    }
    apiFetch<Record<string, unknown>>("/api/admin/cms/seo", { token: token ?? undefined })
      .then((m) => {
        if (!mounted) return;
        const pk = str(m.pageKey);
        setPageKey(pk || "homepage");
        setTitle(str(m.title));
        setDescription(str(m.description));
        setOgImageUrl(str(m.ogImageUrl));
        setSchemaJson(str(m.schemaJson));
      })
      .catch(() => {
        if (!mounted) return;
        setError("Could not load SEO CMS.");
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
        <h1 className="text-2xl font-semibold tracking-tight">SEO management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Default meta fields for the site (stored as one JSON document per environment).
        </p>
      </div>

      {!apiOk ? (
        <div className="text-sm text-muted-foreground">Please sign in as admin.</div>
      ) : null}
      {error ? <div className="rounded-xl border bg-muted/30 p-3 text-sm">{error}</div> : null}

      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle className="text-base">SEO defaults</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Select value={pageKey} onValueChange={setPageKey} disabled={loading || !apiOk}>
            <SelectTrigger>
              <SelectValue placeholder="Page key" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="homepage">homepage</SelectItem>
              <SelectItem value="buy">buy</SelectItem>
              <SelectItem value="locality">locality</SelectItem>
              <SelectItem value="property_type">property_type</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Meta title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading || !apiOk}
          />
          <Textarea
            placeholder="Meta description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            disabled={loading || !apiOk}
          />
          <Input
            placeholder="OG image URL"
            value={ogImageUrl}
            onChange={(e) => setOgImageUrl(e.target.value)}
            disabled={loading || !apiOk}
          />
          <Textarea
            placeholder="Schema JSON"
            value={schemaJson}
            onChange={(e) => setSchemaJson(e.target.value)}
            rows={6}
            disabled={loading || !apiOk}
          />
          <div className="flex justify-end">
            <Button
              disabled={saving || loading || !apiOk}
              onClick={async () => {
                if (!apiOk) return;
                setSaving(true);
                setError(null);
                try {
                  await apiFetch<Record<string, unknown>>("/api/admin/cms/seo", {
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
        </CardContent>
      </Card>
    </div>
  );
}
