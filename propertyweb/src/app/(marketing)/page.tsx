import Link from "next/link";
import { PublicPropertyCard, type PublicPropertySummary } from "@/components/property/public-property-card";
import { RecentlyViewedStrip } from "@/components/property/recently-viewed-strip";
import { HeroSearch } from "@/components/search/hero-search";
import { DragScrollRow } from "@/components/site/drag-scroll-row";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { CursorGlow } from "@/components/ui/cursor-glow";
import { CursorSpotlightTracker } from "@/components/ui/cursor-spotlight";
import { TiltCard } from "@/components/ui/tilt-card";
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
  LandPlot,
  Warehouse,
  Users,
  TrendingUp,
  Clock,
  Sparkles,
  TreePine,
  BadgeCheck,
  Handshake,
  Heart,
  Search,
  MousePointerClick,
  Phone,
  CheckCircle2,
} from "lucide-react";

/* ── Data fetching ─────────────────────────────────── */

const FALLBACK_HERO_TITLE = "Find Your Perfect\nHome in Coastal Mangalore";
const FALLBACK_HERO_SUBTITLE =
  "Verified apartments, villas, plots & commercial spaces — browse, shortlist and enquire directly with owners.";

type HomeCms = { heroTitle: string; heroSubtitle: string; bannerUrl: string; featuredPropertyIds: string; featuredLocalities: string; testimonialsNote: string };

async function getHomepageCms(): Promise<HomeCms> {
  const fallback: HomeCms = { heroTitle: FALLBACK_HERO_TITLE, heroSubtitle: FALLBACK_HERO_SUBTITLE, bannerUrl: "", featuredPropertyIds: "", featuredLocalities: "", testimonialsNote: "" };
  try {
    const m = await apiFetch<Record<string, unknown>>("/api/public/cms/homepage");
    const s = (v: unknown) => (typeof v === "string" ? v : "");
    return { heroTitle: s(m.heroTitle).trim() || fallback.heroTitle, heroSubtitle: s(m.heroSubtitle).trim() || fallback.heroSubtitle, bannerUrl: s(m.bannerUrl).trim(), featuredPropertyIds: s(m.featuredPropertyIds).trim(), featuredLocalities: s(m.featuredLocalities).trim(), testimonialsNote: s(m.testimonialsNote).trim() };
  } catch { return fallback; }
}

async function getFeaturedListings(idsCsv: string): Promise<PublicPropertySummary[]> {
  const parts = idsCsv.split(/[,;\s]+/).map((x) => x.trim()).filter(Boolean);
  if (!parts.length) return [];
  try { return (await apiFetch<PublicPropertySummary[]>(`/api/public/properties/featured?ids=${encodeURIComponent(parts.join(","))}`)) ?? []; } catch { return []; }
}

async function getHomeListings(): Promise<PublicPropertySummary[]> {
  try { const res = await apiFetch<PageResponse<PublicPropertySummary>>("/api/public/properties?page=0&size=12"); return res.content ?? []; } catch { return []; }
}

type PublicTestimonial = { id?: number; name?: string | null; designation?: string | null; comment?: string | null; imageUrl?: string | null };

async function getPublicTestimonials(): Promise<PublicTestimonial[]> {
  try { return (await apiFetch<PublicTestimonial[]>("/api/public/testimonials")) ?? []; } catch { return []; }
}

async function getLocalities(): Promise<{ id: number; name: string; slug: string; isFeatured: boolean }[]> {
  try { return (await apiFetch<{ id: number; name: string; slug: string; isFeatured: boolean }[]>("/api/public/localities")) ?? []; } catch { return []; }
}

/* ── Static data ───────────────────────────────────── */

const PROPERTY_TYPES = [
  { label: "Apartment",  slug: "apartment",         icon: Building2, color: "bg-blue-500/10 text-blue-600" },
  { label: "Villa",      slug: "villa",             icon: TreePine,  color: "bg-emerald-500/10 text-emerald-600" },
  { label: "House",      slug: "independent-house", icon: Home,      color: "bg-violet-500/10 text-violet-600" },
  { label: "Plot",       slug: "plot",              icon: LandPlot,  color: "bg-amber-500/10 text-amber-600" },
  { label: "Commercial", slug: "commercial",        icon: Warehouse, color: "bg-rose-500/10 text-rose-600" },
  { label: "PG",         slug: "pg-hostel",         icon: Users,     color: "bg-cyan-500/10 text-cyan-600" },
];

const HOW_IT_WORKS = [
  { step: "1", icon: Search,             title: "Search",    desc: "Browse by locality, type or budget" },
  { step: "2", icon: MousePointerClick,  title: "Shortlist",  desc: "Save and compare your favourites" },
  { step: "3", icon: Phone,              title: "Connect",    desc: "Enquire directly with the owner" },
  { step: "4", icon: CheckCircle2,       title: "Visit",      desc: "Schedule a visit and close the deal" },
];

/* ── Page ──────────────────────────────────────────── */

export default async function HomePage() {
  const cms = await getHomepageCms();
  const [featured, fallbackList, apiTestimonials, apiLocalities] = await Promise.all([
    getFeaturedListings(cms.featuredPropertyIds), getHomeListings(), getPublicTestimonials(), getLocalities(),
  ]);
  const listings = featured.length ? featured : (fallbackList.length ? fallbackList : SAMPLE_LISTINGS);
  const isSample = !featured.length && !fallbackList.length;
  const localities = apiLocalities.length ? apiLocalities : SAMPLE_LOCALITIES;
  const testimonials = apiTestimonials.length ? apiTestimonials : SAMPLE_TESTIMONIALS;
  const [headLine1, headLine2] = splitHeadline(cms.heroTitle);

  return (
    <div className="min-h-screen bg-background">
      <CursorSpotlightTracker />

      {/* ━━━ 1. HERO — clean: headline + search only ━━━ */}
      <section className="cursor-spotlight relative -mt-16 overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-deep via-[#0a3d36] to-[#0f2027]" />
        <video autoPlay muted loop playsInline preload="auto" className="absolute inset-0 h-full w-full object-cover opacity-35">
          <source src="https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_30fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-28 pb-24 sm:px-6 sm:pt-32 sm:pb-28 lg:px-8 lg:pt-36 lg:pb-32">
          <div className="mx-auto max-w-3xl text-center">
            <div
              className="animate-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm"
              style={{ animationDelay: "0.05s", animationFillMode: "both" }}
            >
              <BadgeCheck className="size-3.5 text-accent" />
              Mangalore&apos;s Trusted Property Platform
            </div>

            <h1
              className="animate-fade-up display-headline text-white drop-shadow-lg"
              style={{ fontSize: "clamp(2rem, 5.5vw, 3.75rem)", animationDelay: "0.1s", animationFillMode: "both" }}
            >
              {headLine1}
              {headLine2 && <><br /><span className="text-accent">{headLine2}</span></>}
            </h1>

            <p
              className="animate-fade-up mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/60"
              style={{ animationDelay: "0.18s", animationFillMode: "both" }}
            >
              {cms.heroSubtitle}
            </p>

            <div className="animate-fade-up mx-auto mt-7 max-w-2xl" style={{ animationDelay: "0.25s", animationFillMode: "both" }}>
              <HeroSearch />
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ━━━ 2. BROWSE BY TYPE — floating cards with effects ━━━ */}
      <section className="scroll-animate relative z-10 -mt-10 pb-2">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-lg backdrop-blur-md sm:p-5">
            <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide sm:gap-3">
              <Link href="/listings" className="group flex shrink-0 flex-col items-center gap-2 rounded-xl p-3 transition-all hover:-translate-y-1 hover:shadow-md sm:px-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-white shadow-button transition-transform group-hover:scale-110">
                  <Search className="size-5" />
                </div>
                <span className="text-[11px] font-bold text-primary">All</span>
              </Link>
              {PROPERTY_TYPES.map((pt) => {
                const Icon = pt.icon;
                return (
                  <Link
                    key={pt.slug}
                    href={`/listings?type=${pt.slug}`}
                    className="group flex shrink-0 flex-col items-center gap-2 rounded-xl p-3 transition-all hover:-translate-y-1 hover:shadow-md sm:px-4"
                  >
                    <div className={`flex size-12 items-center justify-center rounded-2xl ${pt.color} shadow-sm transition-transform group-hover:scale-110 group-hover:shadow-md`}>
                      <Icon className="size-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground">{pt.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ HOW IT WORKS — minimal strip ━━━ */}
      <section className="scroll-animate bg-background py-6">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 sm:gap-0">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="flex items-center">
                <div className="flex items-center gap-2 px-2 sm:px-4">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                    {item.step}
                  </div>
                  <span className="hidden text-xs font-semibold sm:inline">{item.title}</span>
                  <span className="text-xs font-semibold sm:hidden">{item.title}</span>
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden h-px w-8 bg-border sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 3. FEATURED LISTINGS ━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="scroll-animate bg-background py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-1.5">Featured Properties</p>
              <h2 className="section-heading">Handpicked for You</h2>
            </div>
            <div className="hidden shrink-0 items-center gap-3 sm:flex">
              {isSample && (
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">Sample</span>
              )}
              <Link href="/listings" className="group inline-flex items-center gap-1.5 rounded-xl bg-primary-soft px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white">
                View all <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {listings.length ? (
            <>
              <div className="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4">
                {listings.slice(0, 8).map((p) => <PublicPropertyCard key={p.id} property={p} />)}
              </div>
              <div className="sm:hidden">
                <DragScrollRow>
                  {listings.slice(0, 8).map((p) => (
                    <div key={p.id} className="w-[75vw] max-w-[280px] shrink-0 snap-start">
                      <PublicPropertyCard property={p} />
                    </div>
                  ))}
                </DragScrollRow>
              </div>
              <div className="mt-6 text-center sm:hidden">
                <Link href="/listings" className="inline-flex items-center gap-1.5 rounded-xl bg-primary-soft px-5 py-2.5 text-sm font-semibold text-primary">
                  View all <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </>
          ) : (
            <EmptyState icon={<Building2 className="size-7 text-primary/50" />} title="No listings yet" desc="New verified listings go live here every week." />
          )}
        </div>
      </section>

      {/* ━━━ 4. STATS BAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="scroll-animate border-y bg-brand-deep py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-4 sm:gap-16 sm:px-6 lg:px-8">
          {[
            { value: "500+", label: "Verified Properties", icon: Building2 },
            { value: "7,000+", label: "Happy Families", icon: Heart },
            { value: "14+", label: "Localities Covered", icon: MapPin },
            { value: "32", label: "Years of Trust", icon: ShieldCheck },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-3 text-center">
                <Icon className="size-5 text-accent/70" />
                <div>
                  <AnimatedCounter value={s.value} className="text-2xl font-black tabular-nums text-white" />
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ━━━ 5. RECENTLY VIEWED ━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <RecentlyViewedStrip />
        </div>
      </section>

      {/* ━━━ 6. EXPLORE LOCALITIES ━━━━━━━━━━━━━━━━━━━━ */}
      {localities.length > 0 && (
        <section className="scroll-animate bg-surface py-14 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-1.5">Explore Localities</p>
                <h2 className="section-heading">Find by Neighbourhood</h2>
              </div>
              <Link href="/localities" className="group hidden shrink-0 items-center gap-1.5 rounded-xl bg-primary-soft px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white sm:inline-flex">
                All areas <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {localities.filter((l) => l.isFeatured).slice(0, 6).map((loc) => (
                <Link
                  key={loc.slug}
                  href={`/listings?locality=${loc.slug}`}
                  className="gradient-border-animated card-hover group relative overflow-hidden rounded-2xl border bg-card p-4 shadow-card sm:p-5"
                >
                  <div className="absolute -right-6 -top-6 size-20 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
                  <div className="relative flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary transition-transform group-hover:scale-110">
                      <MapPin className="size-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold group-hover:text-primary transition-colors">{loc.name}</div>
                      <div className="text-[11px] text-muted-foreground">Mangalore</div>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </Link>
              ))}
            </div>

            {localities.filter((l) => !l.isFeatured).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {localities.filter((l) => !l.isFeatured).slice(0, 10).map((loc) => (
                  <Link key={loc.slug} href={`/listings?locality=${loc.slug}`}
                    className="pill inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-primary">
                    <MapPin className="size-2.5" />{loc.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ━━━ 7. DUAL CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="scroll-animate bg-background py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="group relative overflow-hidden rounded-2xl border bg-card p-7 transition-all hover:shadow-lift md:p-8">
              <CursorGlow color="rgba(15,123,108,0.06)" />
              <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/5 transition-transform group-hover:scale-125" />
              <div className="relative">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Home className="size-6" />
                </div>
                <h3 className="mt-5 text-xl font-bold">Find Your Dream Home</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Browse 500+ verified properties. Direct owner contact, zero brokerage.</p>
                <Link href="/listings" className="group/btn mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-button transition-all hover:brightness-110 press-effect">
                  Start Browsing <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
              </div>
            </div>

            <div className="noise group relative overflow-hidden rounded-2xl bg-brand-deep p-7 text-white transition-all hover:shadow-lift md:p-8">
              <CursorGlow color="rgba(232,160,32,0.05)" />
              <div className="absolute -right-8 -top-8 size-32 rounded-full bg-accent/10 transition-transform group-hover:scale-125" />
              <div className="relative">
                <div className="flex size-12 items-center justify-center rounded-xl bg-accent/20 text-accent">
                  <TrendingUp className="size-6" />
                </div>
                <h3 className="mt-5 text-xl font-bold">List Your Property Free</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">Reach thousands of buyers. Post in 2 minutes, get enquiries fast.</p>
                <Link href="/seller/properties/new" className="group/btn mt-6 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/20 press-effect">
                  Post Property <Sparkles className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ 8. TRUST SIGNALS ━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="scroll-animate bg-surface py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="eyebrow mb-1.5">Why MangaloreHomes</p>
            <h2 className="section-heading">Built on Trust</h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: "Verified Listings",  desc: "Every property manually reviewed", color: "bg-emerald-500/10 text-emerald-600" },
              { icon: Handshake,   title: "Direct Contact",     desc: "Zero middlemen, zero brokerage", color: "bg-blue-500/10 text-blue-600" },
              { icon: MapPin,      title: "Local Expertise",    desc: "Every Mangalore area covered", color: "bg-violet-500/10 text-violet-600" },
              { icon: Clock,       title: "Quick Response",     desc: "Replies within 2 hours", color: "bg-amber-500/10 text-amber-600" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <TiltCard key={item.title} intensity={5}>
                  <div className="group relative overflow-hidden rounded-2xl border bg-card p-5 text-center shadow-card transition-shadow hover:shadow-lift">
                    <CursorGlow />
                    <div className={`relative mx-auto flex size-12 items-center justify-center rounded-xl ${item.color} transition-transform group-hover:scale-110`}>
                      <Icon className="size-5" />
                    </div>
                    <h3 className="relative mt-3 text-sm font-semibold">{item.title}</h3>
                    <p className="relative mt-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━━ 9. TESTIMONIALS ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {testimonials.length > 0 && (
        <section className="scroll-animate bg-background py-14 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="eyebrow mb-1.5">What People Say</p>
              <h2 className="section-heading">Trusted by Families</h2>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.slice(0, 3).map((t, i) => {
                const avatar = t.imageUrl ? mediaAbsoluteUrl(t.imageUrl) : null;
                return (
                  <figure key={t.id ?? `t-${i}`} className="gradient-border-animated group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-lift">
                    <span className="absolute -right-2 -top-4 text-6xl font-black leading-none text-primary/5 select-none">&ldquo;</span>
                    <div className="relative flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, si) => <Star key={si} className="size-3.5 fill-accent text-accent" />)}
                    </div>
                    {t.comment && (
                      <blockquote className="relative mt-3 text-sm leading-relaxed text-foreground/80 line-clamp-3">&ldquo;{t.comment}&rdquo;</blockquote>
                    )}
                    <figcaption className="relative mt-4 flex items-center gap-2.5 border-t pt-4">
                      {avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatar} alt="" className="size-9 rounded-full border-2 border-primary-soft object-cover" />
                      ) : (
                        <div className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                          {(t.name ?? "?")[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        {t.name && <div className="text-xs font-semibold">{t.name}</div>}
                        {t.designation && <div className="text-[10px] text-muted-foreground">{t.designation}</div>}
                      </div>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ━━━ 10. BOTTOM CTA ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="scroll-animate relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#0a5c50]" />
        <div className="absolute -left-16 -top-16 size-56 animate-float-slow rounded-full bg-white/5 blur-xl" />
        <div className="absolute -bottom-12 -right-12 size-44 animate-float-slow rounded-full bg-accent/10 blur-xl" style={{ animationDelay: "2s" }} />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl" style={{ textWrap: "balance" }}>
            Ready to Find Your Home?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/70">
            Join 7,000+ families who found their home through MangaloreHomes
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/listings" className="pulse-glow inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-primary shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl press-effect">
              Browse Properties <ArrowRight className="size-4" />
            </Link>
            <Link href="/seller/properties/new" className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-white/25 px-7 text-sm font-bold text-white transition-all hover:bg-white/10 press-effect">
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
  if (raw.includes("\n")) { const [a, ...rest] = raw.split("\n"); return [a.trim(), rest.join(" ").trim() || null]; }
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
