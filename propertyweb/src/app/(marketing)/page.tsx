import Link from "next/link";
import { PublicPropertyCard, type PublicPropertySummary } from "@/components/property/public-property-card";
import { RecentlyViewedStrip } from "@/components/property/recently-viewed-strip";
import { HeroSearch } from "@/components/search/hero-search";
import { DragScrollRow } from "@/components/site/drag-scroll-row";
import { apiFetch, mediaAbsoluteUrl } from "@/lib/api";
import type { PageResponse } from "@/lib/page-response";
import {
  ArrowRight,
  Building2,
  Home,
  TrendingUp,
  Shield,
  Star,
  MapPin,
  Phone,
  CheckCircle2,
  Sparkles,
  Key,
  LandPlot,
  Warehouse,
  Quote,
} from "lucide-react";

const FALLBACK_HERO_TITLE = "Find a home worth\ncoming back to.";
const FALLBACK_HERO_SUBTITLE =
  "Verified apartments, villas, plots and commercial spaces across Mangalore — browse, shortlist and enquire directly.";

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
    const list = await apiFetch<PublicPropertySummary[]>(
      `/api/public/properties/featured?ids=${encodeURIComponent(parts.join(","))}`
    );
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function getHomeListings(): Promise<PublicPropertySummary[]> {
  try {
    const res = await apiFetch<PageResponse<PublicPropertySummary>>("/api/public/properties?page=0&size=8");
    return res.content ?? [];
  } catch {
    return [];
  }
}

type PublicTestimonial = {
  id?: number;
  name?: string | null;
  designation?: string | null;
  comment?: string | null;
  imageUrl?: string | null;
};

async function getPublicTestimonials(): Promise<PublicTestimonial[]> {
  try {
    const list = await apiFetch<PublicTestimonial[]>("/api/public/testimonials");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function getLocalities(): Promise<{ id: number; name: string; slug: string; isFeatured: boolean }[]> {
  try {
    const list = await apiFetch<{ id: number; name: string; slug: string; isFeatured: boolean }[]>(
      "/api/public/localities"
    );
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

const PROPERTY_TYPES = [
  { label: "Apartment",         slug: "apartment",          icon: Building2  },
  { label: "Independent House", slug: "independent-house",  icon: Home       },
  { label: "Villa",             slug: "villa",              icon: Star       },
  { label: "Plot / Land",       slug: "plot",               icon: LandPlot   },
  { label: "Commercial",        slug: "commercial",         icon: Warehouse  },
  { label: "PG / Hostel",       slug: "pg-hostel",          icon: Key        },
];

export default async function HomePage() {
  const cms = await getHomepageCms();
  const [featured, fallbackList, testimonials, localities] = await Promise.all([
    getFeaturedListings(cms.featuredPropertyIds),
    getHomeListings(),
    getPublicTestimonials(),
    getLocalities(),
  ]);
  const listings = featured.length ? featured : fallbackList;
  // Split headline on newline or at midpoint for balanced two-line display.
  const [headLine1, headLine2] = splitHeadline(cms.heroTitle);

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ──────────────────────────────────────────
          Full-bleed dark mesh, confident display headline.
          No cartoon blobs — the mesh is baked into the bg. */}
      <section className="hero-mesh noise relative overflow-hidden text-white">
        {/* Animated gradient orbs — adds depth and life */}
        <div aria-hidden className="pointer-events-none absolute -left-32 top-1/4 size-96 rounded-full bg-primary/30 blur-[100px] animate-float" />
        <div aria-hidden className="pointer-events-none absolute -right-24 bottom-1/4 size-80 rounded-full bg-brand-2/25 blur-[90px] animate-float" style={{ animationDelay: "1.5s" }} />
        <div aria-hidden className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 size-64 rounded-full bg-white/5 blur-[80px] animate-float" style={{ animationDelay: "0.8s" }} />

        <div className="relative mx-auto max-w-6xl px-4 pt-24 pb-28 md:pt-32 md:pb-36">
          <div className="mx-auto max-w-4xl text-center">

            {/* Kicker — animated entrance */}
            <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-2 text-xs font-semibold text-white/90 shadow-lg shadow-black/10 backdrop-blur-md" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
              <Sparkles className="size-3.5 text-brand-2 animate-float" />
              Mangalore&apos;s trusted property portal
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">VERIFIED</span>
            </div>

            {/* Display headline — gradient text + animated entrance */}
            <h1 className="animate-fade-up display-headline mt-8 text-[46px] text-white md:text-[66px] lg:text-[80px]" style={{ animationDelay: "0.25s", animationFillMode: "both" }}>
              {headLine1}
              {headLine2 && (
                <>
                  <br />
                  <span className="text-gradient-animate">{headLine2}</span>
                </>
              )}
            </h1>

            <p className="animate-fade-up mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/75 md:text-lg" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
              {cms.heroSubtitle}
            </p>

            {/* Search — glowing container */}
            <div className="animate-fade-up mx-auto mt-12 max-w-2xl" style={{ animationDelay: "0.55s", animationFillMode: "both" }}>
              <div className="rounded-3xl p-[1px] bg-gradient-to-r from-primary/50 via-white/20 to-brand-2/50 shadow-2xl shadow-primary/20">
                <div className="rounded-[23px] bg-slate-950/80 backdrop-blur-xl">
                  <HeroSearch />
                </div>
              </div>
            </div>

            {/* Stats — glowing cards with staggered entrance */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-6">
              {[
                { value: "500+", label: "Verified listings", icon: Building2 },
                { value: "1,200+", label: "Happy buyers", icon: CheckCircle2 },
                { value: `${localities.length || "20"}+`, label: "Localities", icon: MapPin },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className="animate-fade-up group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
                    style={{ animationDelay: `${0.7 + i * 0.1}s`, animationFillMode: "both" }}
                  >
                    <Icon className="size-5 text-white/50 group-hover:text-brand-2 transition-colors" />
                    <div className="text-left">
                      <div className="text-xl font-black tabular-nums text-white md:text-2xl">{s.value}</div>
                      <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/50">{s.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Curved wave transition */}
        <div aria-hidden className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0 60L1440 60L1440 24C1200 56 960 64 720 48C480 32 240 4 0 24L0 60Z" className="fill-background" />
          </svg>
        </div>
      </section>

      {/* ── BUY / RENT / SELL — 3 bold action cards ──────
          The #1 thing a visitor needs to decide. Big, clear, clickable. */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="scroll-animate mb-10 text-center">
            <p className="eyebrow">What are you looking for?</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              Buy, rent or sell
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Buy a property",
                desc: "Apartments, villas, plots and independent houses across Mangalore.",
                href: "/listings?purpose=buy",
                icon: Home,
                label: "Browse",
                accent: "from-primary/10 to-primary/5",
                iconBg: "bg-primary/10 text-primary",
                num: "01",
                dark: false,
              },
              {
                title: "Rent a home",
                desc: "Furnished and unfurnished rentals. Studios to family homes.",
                href: "/listings?purpose=rent",
                icon: Key,
                label: "Explore",
                accent: "from-emerald-500/10 to-emerald-500/5",
                iconBg: "bg-emerald-500/10 text-emerald-600",
                num: "02",
                dark: false,
              },
              {
                title: "List your property",
                desc: "Post for free. Reach verified buyers. No commission.",
                href: "/seller/properties/new",
                icon: TrendingUp,
                label: "Get started",
                accent: "",
                iconBg: "",
                num: "03",
                dark: true,
              },
            ].map((card, ci) => {
              const Icon = card.icon;
              return card.dark ? (
                <Link
                  key={card.href}
                  href={card.href}
                  className="scroll-animate group card-hover relative overflow-hidden rounded-2xl bg-slate-950 p-7 text-white"
                  data-delay={String(ci + 1)}
                >
                  {/* Animated orb */}
                  <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-primary/25 blur-3xl animate-float" />
                  <div aria-hidden className="pointer-events-none absolute -bottom-8 -left-8 size-32 rounded-full bg-brand-2/20 blur-2xl animate-float" style={{ animationDelay: "1s" }} />
                  <div className="relative">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">{card.num}</div>
                    <div className="flex size-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm">
                      <Icon className="size-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-black">{card.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">{card.desc}</p>
                    <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition-all group-hover:bg-white/15">
                      {card.label} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ) : (
                <Link
                  key={card.href}
                  href={card.href}
                  className={`scroll-animate group card-hover relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-linear-to-br ${card.accent} p-7`}
                  data-delay={String(ci + 1)}
                >
                  <div>
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">{card.num}</div>
                    <div className={`flex size-12 items-center justify-center rounded-xl ${card.iconBg} transition-transform group-hover:scale-110`}>
                      <Icon className="size-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-black">{card.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.desc}</p>
                  </div>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    {card.label} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BROWSE BY TYPE — compact row ───────────────── */}
      <section className="border-y bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="scroll-animate eyebrow">Explore</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
                Browse by property type
              </h2>
            </div>
            <Link href="/listings" className="text-sm font-semibold text-primary hover:underline">
              View all <ArrowRight className="inline size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {PROPERTY_TYPES.map((pt) => {
              const Icon = pt.icon;
              return (
                <Link
                  key={pt.slug}
                  href={`/listings?type=${pt.slug}`}
                  className="group card-hover flex flex-col items-center gap-2.5 rounded-xl border border-border/80 bg-card p-4 text-center transition-colors hover:border-primary/30"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                    <Icon className="size-[18px]" />
                  </div>
                  <span className="text-[13px] font-semibold leading-tight">
                    {pt.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURED LISTINGS — photography first ─────── */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="scroll-animate eyebrow">{featured.length ? "Hand-picked" : "Latest"}</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                {featured.length ? "Featured properties" : "New to the market"}
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Verified homes, ready to visit. Enquire directly with the owner.
              </p>
            </div>
            <Link
              href="/listings"
              className="group inline-flex h-10 items-center gap-1.5 rounded-xl border bg-card px-4 text-sm font-semibold text-foreground shadow-soft transition-colors hover:border-primary/30 hover:text-primary"
            >
              View all properties
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {listings.length ? (
            <>
              <div className="hidden gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4">
                {listings.slice(0, 8).map((p) => (
                  <PublicPropertyCard key={p.id} property={p} />
                ))}
              </div>
              <div className="sm:hidden">
                <DragScrollRow>
                  {listings.map((p) => (
                    <div key={p.id} className="w-[80vw] max-w-xs shrink-0">
                      <PublicPropertyCard property={p} />
                    </div>
                  ))}
                  <div className="w-2 shrink-0" aria-hidden />
                </DragScrollRow>
              </div>
            </>
          ) : (
            <EmptyState
              icon={<Building2 className="size-8 text-primary/50" />}
              title="No listings yet"
              desc="New verified listings go live here every week."
            />
          )}
        </div>
      </section>

      {/* ── RECENTLY VIEWED (client-only, localStorage) ── */}
      <section className="border-t py-10">
        <div className="mx-auto max-w-6xl px-4">
          <RecentlyViewedStrip />
        </div>
      </section>

      {/* ── LOCALITIES — grid cards with featured highlight ─── */}
      {localities.length > 0 && (
        <section className="border-y bg-surface py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="scroll-animate eyebrow">Neighbourhoods</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                  Explore by locality
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  From beachside Surathkal to leafy Kadri — pick an area and browse
                  what&apos;s available.
                </p>
              </div>
              <Link
                href="/localities"
                className="group inline-flex h-10 items-center gap-1.5 rounded-xl border bg-card px-4 text-sm font-semibold shadow-soft transition-colors hover:border-primary/30 hover:text-primary"
              >
                All localities <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Featured localities — larger cards with Buy/Rent/Sell links */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
              {localities.filter((l) => l.isFeatured).slice(0, 6).map((loc) => (
                <div key={loc.slug} className="rounded-2xl border bg-card p-5 transition-shadow hover:shadow-soft">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-primary" />
                        <Link href={`/listings?locality=${loc.slug}`} className="text-base font-black hover:text-primary transition-colors hover:underline underline-offset-4">
                          {loc.name}
                        </Link>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Mangalore</p>
                    </div>
                    <Star className="size-4 fill-brand-2 text-brand-2 shrink-0" aria-label="Popular" />
                  </div>
                  {/* Each button is its own independent link — no parent clickable wrapper */}
                  <div className="mt-4 flex items-center gap-2">
                    <Link href={`/listings?locality=${loc.slug}&purpose=buy`} className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20">
                      Buy
                    </Link>
                    <Link href={`/listings?locality=${loc.slug}&purpose=rent`} className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100">
                      Rent
                    </Link>
                    <Link href={`/listings?locality=${loc.slug}&purpose=sell`} className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100">
                      Sell
                    </Link>
                    <Link href={`/listings?locality=${loc.slug}`} className="ml-auto text-xs text-muted-foreground hover:text-primary">
                      All <ArrowRight className="inline size-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Other localities — compact pills */}
            <div className="flex flex-wrap gap-2">
              {localities.filter((l) => !l.isFeatured).slice(0, 12).map((loc) => (
                <Link
                  key={loc.slug}
                  href={`/listings?locality=${loc.slug}`}
                  className="group inline-flex items-center gap-1.5 rounded-full border bg-card px-4 py-2 text-sm font-medium shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary"
                >
                  <MapPin className="size-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
                  {loc.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PROMISE — four-column reassurance row ──────── */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 max-w-xl">
            <p className="scroll-animate eyebrow">Our promise</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              Property-hunting, done properly.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              We personally review every listing and connect you directly with the owner.
              No agents calling you on repeat. No hidden commission.
            </p>
          </div>

          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield,       title: "Verified listings",  desc: "Every property is reviewed before going live." },
              { icon: CheckCircle2, title: "Direct enquiries",   desc: "Contact sellers directly. No middlemen." },
              { icon: Star,         title: "Local expertise",    desc: "Kadri, Bejai, Kottara, Surathkal — all covered." },
              { icon: Phone,        title: "Dedicated support",  desc: "Our team helps you at every step." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="relative">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="absolute right-0 top-0 text-xs font-bold tabular-nums text-muted-foreground/40">
                    0{i + 1}
                  </div>
                  <h3 className="mt-5 text-base font-bold">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — editorial quote cards ───────── */}
      {testimonials.length > 0 && (
        <section className="border-y bg-surface py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-12 max-w-xl">
              <p className="scroll-animate eyebrow">Reviews</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                Trusted by families across the coast.
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t, i) => {
                const avatar = t.imageUrl ? mediaAbsoluteUrl(t.imageUrl) : null;
                return (
                  <figure
                    key={t.id ?? `t-${i}`}
                    className="relative rounded-2xl border bg-card p-6 shadow-soft"
                  >
                    <Quote
                      aria-hidden
                      className="size-7 text-primary/20"
                      strokeWidth={1.5}
                    />
                    {t.comment && (
                      <blockquote className="mt-3 text-[15px] leading-relaxed text-foreground/90">
                        {t.comment}
                      </blockquote>
                    )}
                    <figcaption className="mt-6 flex items-center gap-3 border-t pt-5">
                      {avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatar}
                          alt=""
                          className="size-10 rounded-full border object-cover"
                        />
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {(t.name ?? "?")[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        {t.name && <div className="text-sm font-semibold">{t.name}</div>}
                        {t.designation && (
                          <div className="text-xs text-muted-foreground">{t.designation}</div>
                        )}
                      </div>
                      <div className="ml-auto flex gap-0.5" aria-label="5 of 5 stars">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <Star key={si} className="size-3.5 fill-brand-2 text-brand-2" />
                        ))}
                      </div>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── LIST YOUR PROPERTY CTA — editorial dark ────── */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="noise relative overflow-hidden rounded-3xl bg-brand-deep p-10 text-white md:p-16">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-primary/25 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 left-16 size-64 rounded-full bg-brand-2/20 blur-3xl"
            />

            <div className="relative grid items-end gap-10 md:grid-cols-12">
              <div className="md:col-span-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur-sm">
                  <Sparkles className="size-3 text-brand-2" />
                  Free listing · No commission
                </div>
                <h2 className="display-headline mt-5 text-3xl text-white md:text-5xl">
                  Ready to list your<br />
                  <span className="text-white/70">property?</span>
                </h2>
                <p className="mt-4 max-w-lg text-white/70">
                  Upload photos, add a few details, submit for review. Once approved, your
                  listing goes live and starts getting verified enquiries.
                </p>
                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
                  {["Free to list", "Admin verified", "Direct enquiries", "Instant notifications"].map((f) => (
                    <li key={f} className="flex items-center gap-1.5">
                      <CheckCircle2 className="size-4 text-emerald-400/90" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:col-span-4 md:text-right">
                <Link
                  href="/seller/properties/new"
                  className="group inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-foreground shadow-lift transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Post property free
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <p className="mt-3 text-xs text-white/50 md:text-right">
                  No credit card · 2-minute setup
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

/* ── Local bits ──────────────────────────────────── */

function splitHeadline(raw: string): [string, string | null] {
  if (raw.includes("\n")) {
    const [a, ...rest] = raw.split("\n");
    return [a.trim(), rest.join(" ").trim() || null];
  }
  // No explicit break → try to split at a natural mid-point (after a preposition/conj).
  const words = raw.trim().split(/\s+/);
  if (words.length < 6) return [raw, null];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

function EmptyState({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed bg-card/60 px-6 py-20 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
