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
  Search,
  Handshake,
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
  { label: "Apartment",         slug: "apartment",         icon: Building2, desc: "Flats & apartments",  accent: "bg-indigo-500/10 text-indigo-600"  },
  { label: "Independent House", slug: "independent-house", icon: Home,      desc: "Individual homes",    accent: "bg-teal-500/10 text-teal-600"     },
  { label: "Villa",             slug: "villa",             icon: Star,      desc: "Luxury villas",       accent: "bg-violet-500/10 text-violet-600" },
  { label: "Plot / Land",       slug: "plot",              icon: LandPlot,  desc: "Residential plots",   accent: "bg-amber-500/10 text-amber-600"   },
  { label: "Commercial",        slug: "commercial",        icon: Warehouse, desc: "Office & retail",     accent: "bg-slate-500/10 text-slate-600"   },
  { label: "PG / Hostel",       slug: "pg-hostel",         icon: Key,       desc: "Paying guest rooms",  accent: "bg-emerald-500/10 text-emerald-600" },
];

const TRUSTED_BY = ["Rohan Corp", "Inland Builders", "Land Trades", "Mohtisham Group", "Provident Housing"];

export default async function HomePage() {
  const cms = await getHomepageCms();
  const [featured, fallbackList, testimonials, localities] = await Promise.all([
    getFeaturedListings(cms.featuredPropertyIds),
    getHomeListings(),
    getPublicTestimonials(),
    getLocalities(),
  ]);
  const listings = featured.length ? featured : fallbackList;
  const [headLine1, headLine2] = splitHeadline(cms.heroTitle);

  return (
    <div className="min-h-screen bg-background">

      {/* ━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          Full-height dark mesh, vertically centered content,
          gradient fade to white (no wave). */}
      <section className="hero-mesh noise relative flex min-h-[70vh] flex-col justify-center overflow-hidden text-white md:min-h-[88vh]">
        {/* Ambient gradient blobs */}
        <div aria-hidden className="pointer-events-none absolute -left-40 top-1/4 size-[500px] rounded-full bg-primary/20 blur-[140px]" />
        <div aria-hidden className="pointer-events-none absolute -right-32 bottom-1/3 size-[400px] rounded-full bg-brand-2/15 blur-[120px]" />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 size-72 -translate-x-1/2 rounded-full bg-white/[0.03] blur-[100px]" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">

            {/* Kicker */}
            <div
              className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/80 shadow-lg shadow-black/10 backdrop-blur-md"
              style={{ animationDelay: "0.1s", animationFillMode: "both" }}
            >
              <Sparkles className="size-3.5 animate-float text-brand-2" />
              Mangalore&apos;s trusted property portal
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                VERIFIED
              </span>
            </div>

            {/* Display headline — dramatically larger */}
            <h1
              className="animate-fade-up display-headline mt-10 text-[46px] text-white sm:text-[60px] md:text-[74px] lg:text-[88px]"
              style={{ animationDelay: "0.25s", animationFillMode: "both" }}
            >
              {headLine1}
              {headLine2 && (
                <>
                  <br />
                  <span className="text-gradient-animate">{headLine2}</span>
                </>
              )}
            </h1>

            <p
              className="animate-fade-up mx-auto mt-8 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg lg:text-xl"
              style={{ animationDelay: "0.4s", animationFillMode: "both" }}
            >
              {cms.heroSubtitle}
            </p>

            {/* Search — wider, glowing container */}
            <div
              className="animate-fade-up mx-auto mt-14 max-w-3xl"
              style={{ animationDelay: "0.55s", animationFillMode: "both" }}
            >
              <div className="rounded-[28px] bg-gradient-to-r from-primary/50 via-white/20 to-brand-2/50 p-[1.5px] shadow-2xl shadow-primary/20">
                <div className="rounded-[27px] bg-slate-950/80 backdrop-blur-xl">
                  <HeroSearch />
                </div>
              </div>
            </div>

            {/* Stats — clean text with dividers */}
            <div
              className="animate-fade-up mt-16 flex items-center justify-center"
              style={{ animationDelay: "0.7s", animationFillMode: "both" }}
            >
              <div className="flex items-center gap-6 md:gap-10">
                {[
                  { value: "500+", label: "Verified listings" },
                  { value: "1,200+", label: "Happy buyers" },
                  { value: `${localities.length || "20"}+`, label: "Localities" },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    className={`text-center ${i > 0 ? "border-l border-white/15 pl-6 md:pl-10" : ""}`}
                  >
                    <div className="text-2xl font-black tabular-nums text-white md:text-3xl">
                      {s.value}
                    </div>
                    <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade — modern alternative to wave SVG */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"
        />
      </section>

      {/* ━━ RECENTLY UPLOADED — primary attraction ━━━━━━━
          First thing visitors see after the hero. */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="scroll-animate eyebrow">
                {featured.length ? "Hand-picked" : "Just listed"}
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
                {featured.length ? "Featured properties" : "Recently uploaded"}
              </h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                Fresh listings, verified and ready to visit. Enquire directly
                with the owner.
              </p>
            </div>
            <Link
              href="/listings"
              className="group inline-flex h-11 items-center gap-2 rounded-xl border bg-card px-5 text-sm font-semibold shadow-soft transition-all hover:border-primary/30 hover:text-primary"
            >
              View all properties
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {listings.length ? (
            <>
              {/* Desktop grid */}
              <div className="hidden gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4">
                {listings.slice(0, 8).map((p) => (
                  <PublicPropertyCard key={p.id} property={p} />
                ))}
              </div>
              {/* Mobile carousel */}
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

      {/* ━━ RECENTLY VIEWED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="border-y py-10">
        <div className="mx-auto max-w-6xl px-4">
          <RecentlyViewedStrip />
        </div>
      </section>

      {/* ━━ TRUSTED BY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="border-b py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 md:gap-x-14">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
              Trusted by
            </span>
            {TRUSTED_BY.map((name) => (
              <span
                key={name}
                className="text-sm font-bold tracking-wide text-muted-foreground/35 transition-colors hover:text-muted-foreground/55"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ BROWSE BY TYPE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-4">
          <div className="scroll-animate mb-14 text-center">
            <p className="eyebrow">Explore</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
              What are you looking for?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Browse apartments, villas, plots and more across Mangalore&apos;s
              top localities.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {PROPERTY_TYPES.map((pt) => {
              const Icon = pt.icon;
              return (
                <Link
                  key={pt.slug}
                  href={`/listings?type=${pt.slug}`}
                  className="group card-hover flex flex-col items-center gap-3 rounded-2xl border bg-card p-6 text-center transition-all hover:border-primary/30"
                >
                  <div
                    className={`flex size-14 items-center justify-center rounded-2xl ${pt.accent} transition-transform group-hover:scale-110`}
                  >
                    <Icon className="size-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold">{pt.label}</span>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {pt.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━ HOW IT WORKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          Three-step process, numbered for clarity. */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-4">
          <div className="scroll-animate mb-16 text-center">
            <p className="eyebrow">Simple process</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
              How it works
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: Search,
                title: "Browse & Discover",
                desc: "Search by locality, type, or budget. Every listing is verified by our team before going live.",
                accent: "bg-primary/10 text-primary",
              },
              {
                step: "02",
                icon: Handshake,
                title: "Connect Directly",
                desc: "Contact property owners directly through our platform. No middlemen, no commission.",
                accent: "bg-emerald-500/10 text-emerald-600",
              },
              {
                step: "03",
                icon: Home,
                title: "Move In",
                desc: "Schedule visits, negotiate, and close the deal. Our team supports you at every step.",
                accent: "bg-brand-2/15 text-brand-2",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="scroll-animate relative text-center"
                  data-delay={String(i + 1)}
                >
                  {/* Huge faded step number */}
                  <div className="mx-auto text-[80px] font-black leading-none text-muted-foreground/[0.06] md:text-[100px]">
                    {item.step}
                  </div>
                  {/* Icon */}
                  <div
                    className={`mx-auto -mt-6 flex size-16 items-center justify-center rounded-2xl ${item.accent}`}
                  >
                    <Icon className="size-7" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━ LOCALITIES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          Featured localities as cards, others as pills. */}
      {localities.length > 0 && (
        <section className="bg-surface py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="scroll-animate eyebrow">Neighbourhoods</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
                  Explore by locality
                </h2>
                <p className="mt-3 max-w-md text-muted-foreground">
                  From beachside Surathkal to leafy Kadri — pick an area and see
                  what&apos;s available.
                </p>
              </div>
              <Link
                href="/localities"
                className="group inline-flex h-11 items-center gap-2 rounded-xl border bg-card px-5 text-sm font-semibold shadow-soft transition-all hover:border-primary/30 hover:text-primary"
              >
                All localities
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Featured localities — cards with icon + action buttons */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {localities
                .filter((l) => l.isFeatured)
                .slice(0, 6)
                .map((loc) => (
                  <div
                    key={loc.slug}
                    className="group rounded-2xl border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-soft"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <MapPin className="size-5" />
                      </div>
                      <div>
                        <Link
                          href={`/listings?locality=${loc.slug}`}
                          className="text-base font-bold transition-colors hover:text-primary"
                        >
                          {loc.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          Mangalore
                        </p>
                      </div>
                      <Star
                        className="ml-auto size-4 shrink-0 fill-brand-2 text-brand-2"
                        aria-label="Popular"
                      />
                    </div>
                    <div className="mt-5 flex items-center gap-2">
                      <Link
                        href={`/listings?locality=${loc.slug}&purpose=buy`}
                        className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                      >
                        Buy
                      </Link>
                      <Link
                        href={`/listings?locality=${loc.slug}&purpose=rent`}
                        className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                      >
                        Rent
                      </Link>
                      <Link
                        href={`/listings?locality=${loc.slug}&purpose=sell`}
                        className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                      >
                        Sell
                      </Link>
                      <Link
                        href={`/listings?locality=${loc.slug}`}
                        className="ml-auto text-xs text-muted-foreground hover:text-primary"
                      >
                        All <ArrowRight className="inline size-3" />
                      </Link>
                    </div>
                  </div>
                ))}
            </div>

            {/* Other localities — pill links */}
            <div className="flex flex-wrap gap-2">
              {localities
                .filter((l) => !l.isFeatured)
                .slice(0, 12)
                .map((loc) => (
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

      {/* ━━ WHY CHOOSE US ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          Four reassurance cards with hover effects. */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-4">
          <div className="scroll-animate mb-16 text-center">
            <p className="eyebrow">Why choose us</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
              Property-hunting, done right.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              We personally review every listing and connect you directly with
              the owner. No agents on repeat. No hidden commission.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Shield,
                title: "Verified listings",
                desc: "Every property is reviewed and verified before going live on our platform.",
                num: "01",
              },
              {
                icon: CheckCircle2,
                title: "Direct enquiries",
                desc: "Contact sellers directly. No middlemen, no hidden commission.",
                num: "02",
              },
              {
                icon: Star,
                title: "Local expertise",
                desc: "Deep knowledge of every Mangalore neighbourhood — Kadri to Surathkal.",
                num: "03",
              },
              {
                icon: Phone,
                title: "Dedicated support",
                desc: "Our team is here to help at every step of your property journey.",
                num: "04",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="scroll-animate group rounded-2xl border bg-card p-7 transition-all hover:border-primary/20 hover:shadow-soft"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-xs font-bold tabular-nums text-muted-foreground/30">
                      {item.num}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━ TESTIMONIALS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          Stars-first layout with decorative accents. */}
      {testimonials.length > 0 && (
        <section className="bg-surface py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-4">
            <div className="scroll-animate mb-14 text-center">
              <p className="eyebrow">Reviews</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
                Trusted by families
                <br className="hidden sm:block" /> across the coast
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t, i) => {
                const avatar = t.imageUrl
                  ? mediaAbsoluteUrl(t.imageUrl)
                  : null;
                return (
                  <figure
                    key={t.id ?? `t-${i}`}
                    className="relative overflow-hidden rounded-2xl border bg-card p-8"
                  >
                    {/* Decorative gradient corner */}
                    <div
                      aria-hidden
                      className="absolute -right-8 -top-8 size-24 rounded-full bg-primary/5"
                    />

                    <div className="mb-4 flex gap-0.5" aria-label="5 of 5 stars">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star
                          key={si}
                          className="size-4 fill-brand-2 text-brand-2"
                        />
                      ))}
                    </div>

                    {t.comment && (
                      <blockquote className="relative text-[15px] leading-relaxed text-foreground/85">
                        <Quote
                          aria-hidden
                          className="absolute -left-1 -top-1 size-8 text-primary/10"
                          strokeWidth={1.5}
                        />
                        <span className="relative">{t.comment}</span>
                      </blockquote>
                    )}

                    <figcaption className="mt-6 flex items-center gap-3 border-t pt-5">
                      {avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatar}
                          alt=""
                          className="size-11 rounded-full border object-cover"
                        />
                      ) : (
                        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {(t.name ?? "?")[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        {t.name && (
                          <div className="text-sm font-semibold">{t.name}</div>
                        )}
                        {t.designation && (
                          <div className="text-xs text-muted-foreground">
                            {t.designation}
                          </div>
                        )}
                      </div>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ━━ LIST YOUR PROPERTY CTA ━━━━━━━━━━━━━━━━━━━━━━━
          Dark editorial section with gradient accents. */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-4">
          <div className="noise relative overflow-hidden rounded-3xl bg-brand-deep text-white">
            {/* Decorative gradients */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-primary/20 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-10 size-60 rounded-full bg-brand-2/15 blur-3xl"
            />

            <div className="relative p-10 md:p-16 lg:p-20">
              <div className="grid items-center gap-10 md:grid-cols-12">
                <div className="md:col-span-7">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm">
                    <Sparkles className="size-3 text-brand-2" />
                    Free listing · No commission
                  </div>
                  <h2 className="display-headline mt-6 text-3xl text-white md:text-5xl lg:text-6xl">
                    Ready to list your
                    <br />
                    <span className="text-white/60">property?</span>
                  </h2>
                  <p className="mt-5 max-w-lg text-white/60 md:text-lg">
                    Upload photos, add details, and submit for review. Your
                    listing reaches thousands of verified buyers.
                  </p>
                  <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/60">
                    {[
                      "Free to list",
                      "Admin verified",
                      "Direct enquiries",
                      "Instant notifications",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-emerald-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:col-span-5 md:text-right">
                  <Link
                    href="/seller/properties/new"
                    className="group inline-flex h-14 items-center gap-2 rounded-2xl bg-white px-8 text-base font-bold text-foreground shadow-lift transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
                  >
                    Post property free
                    <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <p className="mt-4 text-xs text-white/40">
                    No credit card required · 2-minute setup
                  </p>
                </div>
              </div>
            </div>
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
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}
