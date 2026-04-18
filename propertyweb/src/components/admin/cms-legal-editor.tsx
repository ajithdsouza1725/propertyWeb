"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import { adminDashboardApiEnabled } from "@/lib/admin-dev";
import { useAccessToken } from "@/lib/use-access-token";

export function CmsLegalEditor({ section, title, description }: { section: string; title: string; description: string }) {
  const token = useAccessToken();
  const apiOk = adminDashboardApiEnabled(token);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    let mounted = true;
    if (!apiOk) {
      setLoading(false);
      return;
    }
    apiFetch<Record<string, unknown>>(`/api/admin/cms/${section}`, { token: token ?? undefined })
      .then((m) => {
        if (!mounted) return;
        setContent(typeof m.content === "string" ? m.content : "");
      })
      .catch(() => {
        if (!mounted) return;
        setError("Could not load content.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [token, section, apiOk]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {!apiOk ? <div className="text-sm text-muted-foreground">Please sign in as admin.</div> : null}
      {error ? <div className="rounded-xl border bg-muted/30 p-3 text-sm">{error}</div> : null}
      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle className="text-base">Content</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Textarea
            rows={22}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading || !apiOk}
            placeholder="Plain text or paragraphs. Shown on the public site with line breaks preserved."
          />
          <div className="flex justify-end">
            <Button
              disabled={saving || loading || !apiOk}
              onClick={async () => {
                if (!apiOk) return;
                setSaving(true);
                setError(null);
                try {
                  await apiFetch(`/api/admin/cms/${section}`, {
                    token: token ?? undefined,
                    method: "PUT",
                    body: { content: content },
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
