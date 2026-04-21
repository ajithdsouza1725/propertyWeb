"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, mediaAbsoluteUrl } from "@/lib/api";
import { adminDashboardApiEnabled } from "@/lib/admin-dev";
import { useAccessToken } from "@/lib/use-access-token";
import { Home, Image, Star, MessageSquare, CheckCircle2, Eye } from "lucide-react";

function str(v: unknown): string {
  if (v == null) return "";
  return String(v);
}

export default function AdminHomepagePage() {
  const token = useAccessToken();
  const apiOk = adminDashboardApiEnabled(token);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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
    if (!apiOk) { setLoading(false); return; }
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
      .catch(() => { if (mounted) setError("Could not load homepage CMS."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [token, apiOk]);

  async function handleSave() {
    if (!apiOk || saving) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await apiFetch("/api/admin/cms/homepage", {
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
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">Homepage CMS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Control the hero section, featured properties, and social proof on the public homepage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Eye className="size-4 mr-1.5" /> Preview site
            </a>
          </Button>
          <Button disabled={saving || loading || !apiOk} onClick={handleSave}>
            {saving ? "Saving…" : saved ? <><CheckCircle2 className="size-4 mr-1.5" /> Saved</> : "Save changes"}
          </Button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hero Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <Home className="size-5 text-muted-foreground" />
              <h2 className="text-base font-bold">Hero section</h2>
            </div>
            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Headline
                </label>
                <Input
                  placeholder="Find Your Perfect Home in Mangalore"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  disabled={loading || !apiOk}
                />
                <p className="mt-1 text-[11px] text-muted-foreground">Use \n for a line break. Second line shows in lighter color.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Subtitle
                </label>
                <Textarea
                  placeholder="Browse verified properties across Kadri, Bejai..."
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  rows={3}
                  disabled={loading || !apiOk}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Banner image URL (optional)
                </label>
                <Input
                  placeholder="https://..."
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  disabled={loading || !apiOk}
                />
                {bannerUrl.trim() && (
                  <div className="mt-2 rounded-lg border overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={bannerUrl.startsWith("http") ? bannerUrl : mediaAbsoluteUrl(bannerUrl)}
                      alt="Banner preview"
                      className="h-24 w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Content */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <Star className="size-5 text-muted-foreground" />
              <h2 className="text-base font-bold">Featured content</h2>
            </div>
            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Featured property IDs
                </label>
                <Textarea
                  placeholder="1, 14, 15, 31 (comma-separated property IDs)"
                  value={featuredPropertyIds}
                  onChange={(e) => setFeaturedPropertyIds(e.target.value)}
                  rows={2}
                  disabled={loading || !apiOk}
                />
                <p className="mt-1 text-[11px] text-muted-foreground">These properties appear in the "Featured" section on the homepage.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Featured localities
                </label>
                <Textarea
                  placeholder="kadri, bejai, kottara (comma-separated slugs)"
                  value={featuredLocalities}
                  onChange={(e) => setFeaturedLocalities(e.target.value)}
                  rows={2}
                  disabled={loading || !apiOk}
                />
                <p className="mt-1 text-[11px] text-muted-foreground">Localities shown prominently. Also configurable from Locations page (is_featured flag).</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <MessageSquare className="size-5 text-muted-foreground" />
              <h2 className="text-base font-bold">Testimonials / Social proof</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Testimonial IDs (optional)
                </label>
                <Input
                  placeholder="1, 2, 3 (or leave empty for latest)"
                  value={testimonialIds}
                  onChange={(e) => setTestimonialIds(e.target.value)}
                  disabled={loading || !apiOk}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Social proof note
                </label>
                <Input
                  placeholder="Trusted by 1,200+ families across Mangalore"
                  value={testimonialsNote}
                  onChange={(e) => setTestimonialsNote(e.target.value)}
                  disabled={loading || !apiOk}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button disabled={saving || loading || !apiOk} onClick={handleSave}>
          {saving ? "Saving…" : saved ? <><CheckCircle2 className="size-4 mr-1.5" /> Saved</> : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
