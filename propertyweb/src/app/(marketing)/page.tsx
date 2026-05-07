import Link from "next/link";
import { PublicPropertyCard, type PublicPropertySummary } from "@/components/property/public-property-card";
import { RecentlyViewedStrip } from "@/components/property/recently-viewed-strip";
import { HeroSearch } from "@/components/search/hero-search";
import { DragScrollRow } from "@/components/site/drag-scroll-row";
import { apiFetch, mediaAbsoluteUrl } from "@/lib/api";
import type { PageResponse } from "@/lib/page-response";
import { SAMPLE_LISTINGS, SAMPLE_LOCALITIES, SAMPLE_TESTIMONIALS } from "@/lib/sample-data";
import {
  ArrowRight,
  Building2,
  Home,
  ShieldCheck,
  Star,
  MapPin,
  Phone,
  ChevronDown,
  LandPlot,
  Warehouse,
  Users,
  Search,
  TrendingUp,
  Clock,
  Sparkles,
  TreePine,
} from "lucide-react";

/* ── Data fetching ─────────────────────────────────── */

const FALLBACK_HERO_TITLE = "Find Your Perfect\nHome in Coastal Mangalore";
const FALLBACK_HERO_SUBTITLE =
  "25+ projects, 7000+ families, 32 years of trust";

type HomeCms = {
  heroTitle: string;
  heroSubtitle: string;
  bannerUrl: string;
  featuredPropertyIds: string;
  featuredLocalities: string;
  testimonialsNote: string;
};

async function getHomepageCms(): Promise<HomeCms> {
  const fallback: HomeCms = {
    heroTitle: FALLBACK_HERO_TITLE,
    heroSubtitle: FALLBACK_HERO_SUBTITLE,
    bannerUrl: "",
    featuredPropertyIds: "",
    featuredLocalities: "",
    testimonialsNote: "",
  };
  try {
    const m = await apiFetch<Record<string, unknown>>("/api/public/cms/homepage");
    const s = (v: unknown) => (typeof v === "string" ? v : "");
    return {
      heroTitle: s(m.heroTitle).trim() || fallback.heroTitle,
      heroSubtitle: s(m.heroSubtitle).trim() || fallback.heroSubtitle,
      bannerUrl: s(m.bannerUrl).trim(),
      featuredPropertyIds: s(m.featuredPropertyIds).trim(),
      featuredLocalities: s(m.featuredLocalities).trim(),
      testimonialsNote: s(m.testimonialsNote).trim(),
    };
  } catch {
    return fallback;
  }
}

async function getFeaturedListings(idsCsv: string): Promise<PublicPropertySummary[]> {
  const parts = idsCsv.split(/[,;\s]+/).map((x) => x.trim()).filter(Boolean);
  if (!parts.length) return [];
  try {
    return (await apiFetch<PublicPropertySummary[]>(
      `/api/public/properties/featured?ids=${encodeURIComponent(parts.join(","))}`
    )) ?? [];
  } catch { return []; }
}

async function getHomeListings(): Promise<PublicPropertySummary[]> {
  try {
    const res = await apiFetch<PageResponse<PublicPropertySummary>>("/api/public/properties?page=0&size=12");
    return res.content ?? [];
  } catch { return []; }
}

type PublicTestimonial = {
  id?: number; name?: string | null; designation?: string | null;
  comment?: string | null; imageUrl?: string | null;
};

async function getPublicTestimonials(): Promise<PublicTestimonial[]> {
  try {
    return (await apiFetch<PublicTestimonial[]>("/api/public/testimonials")) ?? [];
  } catch { return []; }
}

async function getLocalities(): Promise<{ id: number; name: string; slug: string; isFeatured: boolean }[]> {
  try {
    return (await apiFetch<{ id: number; name: string; slug: string; isFeatured: boolean }[]>("/api/public/localities")) ?? [];
  } catch { return []; }
}

/* ── Static data ───────────────────────────────────── */

const PROPERTY_TYPES = [
  { label: "Apartment",    slug: "apartment",         icon: Building2 },
  { label: "Villa",        slug: "villa",             icon: TreePine },
  { label: "House",        slug: "independent-house", icon: Home },
  { label: "Plot",         slug: "plot",              icon: LandPlot },
  { label: "Commercial",   slug: "commercial",        icon: Warehouse },
  { label: "PG / Co-living", slug: "pg-hostel",       icon: Users },
];

/* ── Page ──────────────────────────────────────────── */

export default async function HomePage() {
  const cms = await getHomepageCms();
  const [featured, fallbackList, apiTestimonials, apiLocalities] = await Promise.all([
    getFeaturedListings(cms.featuredPropertyIds),
    getHomeListings(),
    getPublicTestimonials(),
    getLocalities(),
  ]);
  const listings = featured.length ? featured : (fallbackList.length ? fallbackList : SAMPLE_LISTINGS);
  const isSample = !featured.length && !fallbackList.length;
  const localities = apiLocalities.length ? apiLocalities : SAMPLE_LOCALITIES;
  const testimonials = apiTestimonials.length ? apiTestimonials : SAMPLE_TESTIMONIALS;
  const [headLine1, headLine2] = splitHeadline(cms.heroTitle);

  return (
    <div className="min-h-screen bg-background">

      {/* ── SECTION 1: HERO ──────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden text-white">
        {/* Gradient fallback — always visible while video loads or if it fails */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-deep via-[#0a3d36] to-[#0f2027]" />

        {/* Video background — multiple sizes for fast load */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        >
          <source src="https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_30fps.mp4" type="video/mp4" />
        </video>

        {/* Overlay layers for depth */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

        {/* Bottom gradient merge into background */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Eyebrow pill */}
            <div
              className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white"
              style={{ animationDelay: "0.05s", animationFillMode: "both" }}
            >
              Mangalore&apos;s #1 Property Platform
            </div>

            {/* Headline */}
            <h1
              className="animate-fade-up display-headline text-white"
              style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)", animationDelay: "0.15s", animationFillMode: "both" }}
            >
              {headLine1}
              {headLine2 && (
                <><br />{headLine2}</>
              )}
            </h1>

            {/* Subtitle */}
            <p
              className="animate-fade-up mx-auto mt-4 max-w-md text-base leading-relaxed text-white/70"
              style={{ animationDelay: "0.25s", animationFillMode: "both" }}
            >
              {cms.heroSubtitle}
            </p>

            {/* Search bar */}
            <div
              className="animate-fade-up mx-auto mt-8 max-w-2xl"
              style={{ animationDelay: "0.35s", animationFillMode: "both" }}
            >
              <HeroSearch />
            </div>

            {/* Stats row */}
            <div
              className="animate-fade-up mt-10 flex items-center justify-center gap-8"
              style={{ animationDelay: "0.45s", animationFillMode: "both" }}
            >
              {[
                { value: "25+", label: "Projects" },
                { value: "7,000+", label: "Families" },
                { value: "32", label: "Years" },
              ].map((s, i) => (
                <div key={s.label} className={`text-center ${i > 0 ? "border-l border-white/15 pl-8" : ""}`}>
                  <div className="text-2xl font-black tabular-nums text-white">{s.value}</div>
                  <div className="text-xs font-medium text-white/60">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <ChevronDown className="size-6 animate-bounce-down text-white/50" />
          </div>
        </div>

        {/* Wave divider */}
        <div aria-hidden className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 40" fill="none" className="w-full" preserveAspectRatio="none">
            <path d="M0 40h1440V16C1200 38 960 44 720 34 480 24 240 4 0 16v24Z" className="fill-background" />
          </svg>
        </div>
      </section>

      {/* ── SECTION 2: PROPERTY TYPE CHIPS ───────────── */}
      <section className="scroll-animate bg-background py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="eyebrow mb-4">Browse by Type</p>
          <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 scrollbar-hide">
            <Link
              href="/listings"
              className="pill shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              All
            </Link>
            {PROPERTY_TYPES.map((pt) => {
              const Icon = pt.icon;
              return (
                <Link
                  key={pt.slug}
                  href={`/listings?type=${pt.slug}`}
                  className="pill group inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="size-4 text-muted-foreground group-hover:text-primary" />
                  {pt.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: FEATURED LISTINGS ────────────── */}
      <section className="scroll-animate bg-background py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">Featured Properties</p>
              <h2 className="section-heading">Handpicked for You</h2>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {isSample && (
                <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                  Showing sample listings
                </span>
              )}
              <Link
                href="/listings"
                className="group inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                View all properties <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {listings.length ? (
            <>
              <div className="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4">
                {listings.slice(0, 8).map((p) => (
                  <PublicPropertyCard key={p.id} property={p} />
                ))}
              </div>
              <div className="sm:hidden">
                <DragScrollRow>
                  {listings.slice(0, 8).map((p) => (
                    <div key={p.id} className="w-[75vw] max-w-[280px] shrink-0 snap-start">
                      <PublicPropertyCard property={p} />
                    </div>
                  ))}
                  <div className="w-2 shrink-0" aria-hidden />
                </DragScrollRow>
              </div>

              <div className="mt-6 text-center sm:hidden">
                <Link href="/listings" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Browse all properties <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </>
          ) : (
            <EmptyState
              icon={<Building2 className="size-7 text-primary/50" />}
              title="No listings yet"
              desc="New verified listings go live here every week."
            />
          )}
        </div>
      </section>

      {/* ── SECTION 4: RECENTLY VIEWED ──────────────── */}
      <section className="border-y py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <RecentlyViewedStrip />
        </div>
      </section>

      {/* ── SECTION 5: EXPLORE LOCALITIES ─────────────── */}
      {localities.length > 0 && (
        <section className="scroll-animate bg-surface py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-2">Explore Localities</p>
                <h2 className="section-heading">Find by Neighbourhood</h2>
              </div>
              <Link href="/localities" className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">
                All areas <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Featured localities — cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {localities.filter((l) => l.isFeatured).slice(0, 6).map((loc) => (
                <Link
                  key={loc.slug}
                  href={`/listings?locality=${loc.slug}`}
                  className="card-hover group flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-card"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <MapPin className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold group-hover:text-primary transition-colors">{loc.name}</div>
                    <div className="text-xs text-muted-foreground">Mangalore</div>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              ))}
            </div>

            {/* Non-featured as pills */}
            {localities.filter((l) => !l.isFeatured).length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {localities.filter((l) => !l.isFeatured).slice(0, 10).map((loc) => (
                  <Link
                    key={loc.slug}
                    href={`/listings?locality=${loc.slug}`}
                    className="pill inline-flex items-center gap-1.5 rounded-full border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <MapPin className="size-3" />
                    {loc.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── SECTION 6: DUAL CTA ──────────────────────── */}
      <section className="scroll-animate bg-background py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Buyer CTA */}
            <div className="rounded-2xl border bg-card p-8 md:p-10">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Home className="size-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold">Find Your Dream Home</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground" style={{ maxWidth: "68ch" }}>
                Browse 500+ verified properties across Mangalore.
                Direct owner contact, no brokerage.
              </p>
              <Link
                href="/listings"
                className="group mt-6 inline-flex items-center gap-1.5 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-button transition-all hover:brightness-110 press-effect"
              >
                Start Browsing <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Seller CTA */}
            <div className="noise relative overflow-hidden rounded-2xl bg-brand-deep p-8 text-white md:p-10">
              <div className="relative">
                <div className="flex size-12 items-center justify-center rounded-xl bg-accent/20 text-accent">
                  <Building2 className="size-6" />
                </div>
                <h3 className="mt-5 text-xl font-bold">List Your Property Free</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70" style={{ maxWidth: "68ch" }}>
                  Reach thousands of buyers.
                  Post in minutes, get enquiries fast.
                </p>
                <Link
                  href="/seller/properties/new"
                  className="group mt-6 inline-flex items-center gap-1.5 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 press-effect"
                >
                  Post Property <Sparkles className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: TRUST SIGNALS ─────────────────── */}
      <section className="scroll-animate bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="eyebrow mb-2">Why MangaloreHomes</p>
          <h2 className="section-heading mb-10">Built on Trust</h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: "Verified Listings",  desc: "Every property manually reviewed" },
              { icon: Phone,       title: "Direct Contact",     desc: "Talk directly to owners, no middlemen" },
              { icon: MapPin,      title: "Local Expertise",    desc: "Deep knowledge of Mangalore market" },
              { icon: Clock,       title: "Quick Response",     desc: "Get replies within 2 hours" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trusted by */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t pt-8">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/40">Trusted by</span>
            {["Bank Partner", "Builder Group", "Housing Finance", "Real Estate Assoc."].map((name) => (
              <span key={name} className="pill rounded-lg border border-border/60 px-4 py-2 text-xs font-medium text-muted-foreground/40">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 8: TESTIMONIALS ──────────────────── */}
      {testimonials.length > 0 && (
        <section className="scroll-animate bg-background py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="eyebrow mb-2">What People Say</p>
            <h2 className="section-heading mb-8">Trusted by Families</h2>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.slice(0, 3).map((t, i) => {
                const avatar = t.imageUrl ? mediaAbsoluteUrl(t.imageUrl) : null;
                return (
                  <figure key={t.id ?? `t-${i}`} className="rounded-2xl border bg-card p-6 shadow-card">
                    <div className="flex gap-0.5" aria-label="5 stars">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} className="size-4 fill-accent text-accent" />
                      ))}
                    </div>
                    {t.comment && (
                      <blockquote className="mt-3 text-sm italic leading-relaxed text-muted-foreground line-clamp-4">
                        &ldquo;{t.comment}&rdquo;
                      </blockquote>
                    )}
                    <figcaption className="mt-4 flex items-center gap-3 border-t pt-4">
                      {avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatar} alt="" className="size-10 rounded-full border object-cover" />
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                          {(t.name ?? "?")[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        {t.name && <div className="text-sm font-semibold">{t.name}</div>}
                        {t.designation && <div className="text-xs text-muted-foreground">{t.designation}</div>}
                      </div>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 9: BOTTOM CTA ────────────────────── */}
      <section className="scroll-animate bg-primary py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl" style={{ textWrap: "balance" }}>
            Ready to Find Your Home?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-white/80">
            Join 7,000+ families who found their home through MangaloreHomes
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/listings"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-8 text-sm font-semibold text-primary shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg press-effect"
            >
              Browse Properties <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/seller/properties/new"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/30 px-8 text-sm font-semibold text-white transition-colors hover:bg-white/10 press-effect"
            >
              List for Free <Sparkles className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────── */

function splitHeadline(raw: string): [string, string | null] {
  if (raw.includes("\n")) {
    const [a, ...rest] = raw.split("\n");
    return [a.trim(), rest.join(" ").trim() || null];
  }
  const words = raw.trim().split(/\s+/);
  if (words.length < 6) return [raw, null];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card/60 px-6 py-14 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary-soft">{icon}</div>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
