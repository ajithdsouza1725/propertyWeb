"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";

import { adminDashboardApiEnabled } from "@/lib/admin-dev";
import { useAccessToken } from "@/lib/use-access-token";

function str(v: unknown): string {
  if (v == null) return "";
  return String(v);
}

export default function AdminHomepagePage() {
  const token = useAccessToken();
  const apiOk = adminDashboardApiEnabled(token);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [featuredPropertyIds, setFeaturedPropertyIds] = useState("");
  const [featuredLocalities, setFeaturedLocalities] = useState("");
  const [testimonialIds, setTestimonialIds] = useState("");
  const [testimonialsNote, setTestimonialsNote] = useState("");

  useEffect(() => {
    let mounted = true;
    if (!apiOk) {
      setLoading(false);
      return;
    }
    apiFetch<Record<string, unknown>>("/api/admin/cms/homepage", { token: token ?? undefined })
      .then((m) => {
        if (!mounted) return;
        setHeroTitle(str(m.heroTitle));
        setHeroSubtitle(str(m.heroSubtitle));
        setBannerUrl(str(m.bannerUrl));
        setFeaturedPropertyIds(str(m.featuredPropertyIds));
        setFeaturedLocalities(str(m.featuredLocalities));
        setTestimonialIds(str(m.testimonialIds));
        setTestimonialsNote(str(m.testimonialsNote));
      })
      .catch(() => {
        if (!mounted) return;
        setError("Could not load homepage CMS.");
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
        <h1 className="text-2xl font-semibold tracking-tight">Homepage management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hero copy and featured content stored in the API (public site reads from the same data).
        </p>
      </div>

      {!apiOk ? (
        <div className="text-sm text-muted-foreground">Please sign in as admin.</div>
      ) : null}
      {error ? <div className="rounded-xl border bg-muted/30 p-3 text-sm">{error}</div> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-muted/60">
          <CardHeader>
            <CardTitle className="text-base">Hero</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Input
              placeholder="Hero title"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              disabled={loading || !apiOk}
            />
            <Textarea
              placeholder="Hero subtitle"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              rows={4}
              disabled={loading || !apiOk}
            />
            <Input
              placeholder="Banner image URL"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              disabled={loading || !apiOk}
            />
          </CardContent>
        </Card>

        <Card className="border-muted/60">
          <CardHeader>
            <CardTitle className="text-base">Featured content</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Textarea
              placeholder="Featured property IDs (comma separated)"
              value={featuredPropertyIds}
              onChange={(e) => setFeaturedPropertyIds(e.target.value)}
              rows={4}
              disabled={loading || !apiOk}
            />
            <Textarea
              placeholder="Featured localities (comma separated)"
              value={featuredLocalities}
              onChange={(e) => setFeaturedLocalities(e.target.value)}
              rows={4}
              disabled={loading || !apiOk}
            />
            <Textarea
              placeholder="Legacy: testimonial IDs (optional)"
              value={testimonialIds}
              onChange={(e) => setTestimonialIds(e.target.value)}
              rows={2}
              disabled={loading || !apiOk}
            />
            <Textarea
              placeholder="Testimonials / social proof (shown on home if filled)"
              value={testimonialsNote}
              onChange={(e) => setTestimonialsNote(e.target.value)}
              rows={5}
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
              await apiFetch<Record<string, unknown>>("/api/admin/cms/homepage", {
                token: token ?? undefined,
                method: "PUT",
                body: {
                  heroTitle: heroTitle.trim(),
                  heroSubtitle: heroSubtitle.trim(),
                  bannerUrl: bannerUrl.trim(),
                  featuredPropertyIds: featuredPropertyIds.trim(),
                  featuredLocalities: featuredLocalities.trim(),
                  testimonialIds: testimonialIds.trim(),
                  testimonialsNote: testimonialsNote.trim(),
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
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
