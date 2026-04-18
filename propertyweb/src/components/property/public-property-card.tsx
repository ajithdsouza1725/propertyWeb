import Link from "next/link";
import { formatCompactINR } from "@/lib/format";
import { mediaAbsoluteUrl } from "@/lib/api";
import { propertyTypeBadgeClass } from "@/lib/property-type-style";
import { CompareButton } from "@/components/property/compare-button";
import { cn } from "@/lib/utils";
import { MapPin, BedDouble, Bath, Maximize2, Star, ShieldCheck, Home } from "lucide-react";

export type PublicPropertySummary = {
  id: number;
  title: string;
  slug: string;
  purpose: string;
  propertyType: string;
  propertyTypeSlug: string;
  locality: string | null;
  localitySlug: string | null;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqft: number | null;
  isFeatured: boolean;
  isVerified: boolean;
  /** True when listing locality is marked featured in catalog (popular area). */
  localityFeatured?: boolean;
  thumbUrl?: string | null;
};

const purposeLabel: Record<string, string> = {
  buy: "Buy",
  sell: "Sell",
  rent: "Rent",
};

export function PublicPropertyCard({ property }: { property: PublicPropertySummary }) {
  const purpose = String(property.purpose ?? "").toLowerCase();
  const isRent = purpose === "rent";
  const thumbSrc = property.thumbUrl ? mediaAbsoluteUrl(property.thumbUrl) : null;
  const label = purposeLabel[purpose] ?? "Buy";

  // Badge priority — show at most 2: featured > verified > purpose.
  // This keeps the image clean instead of 3 stacked pills.
  const showFeatured = property.isFeatured;
  const showVerified = property.isVerified && !showFeatured;

  return (
    <Link
      href={`/property/${property.slug}`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
      aria-label={`${property.title} — ${formatCompactINR(Number(property.price ?? 0))}${isRent ? " per month" : ""}`}
    >
      <article className="card-hover overflow-hidden rounded-2xl border border-border/70 bg-card">
        {/* Image — 4:3, generous bleed */}
        <div className="relative aspect-4/3 overflow-hidden bg-muted">
          {thumbSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbSrc}
              alt={property.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted to-secondary">
              <Home className="size-10 text-muted-foreground/40" strokeWidth={1.25} />
            </div>
          )}

          {/* Bottom scrim — lets price pill breathe over any image */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/55 to-transparent"
          />

          {/* Top-right: ONE pill at a time. Featured > Verified. Purpose stays subtle top-left. */}
          {showFeatured && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-soft">
              <Star className="size-3 fill-white" />
              Featured
            </span>
          )}
          {showVerified && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 shadow-soft backdrop-blur-sm">
              <ShieldCheck className="size-3" />
              Verified
            </span>
          )}

          {/* Top-left: purpose label. Monochrome, glass — doesn't fight imagery. */}
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-soft backdrop-blur-sm">
            {label}
          </span>

          {/* Price — the decision criterion; largest white on scrim */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1 text-white">
                <span className="text-xl font-black tabular-nums drop-shadow-sm md:text-2xl">
                  {formatCompactINR(Number(property.price ?? 0))}
                </span>
                {isRent && <span className="text-xs font-medium text-white/80">/mo</span>}
              </div>
              {property.locality && (
                <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-white/85">
                  <MapPin className="size-3" />
                  <span className="line-clamp-1">{property.locality}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body — title + specs row. Tight. */}
        <div className="p-4">
          <h3 className="line-clamp-2 min-h-[2.5em] text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {property.title}
          </h3>

          {/* Specs row — inline, divided by subtle dot */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/60 pt-3 text-xs text-muted-foreground">
            {property.bedrooms != null && (
              <Spec icon={<BedDouble className="size-3.5" />} value={`${property.bedrooms} Bed`} />
            )}
            {property.bathrooms != null && (
              <Spec icon={<Bath className="size-3.5" />} value={`${property.bathrooms} Bath`} />
            )}
            {property.areaSqft != null && (
              <Spec
                icon={<Maximize2 className="size-3.5" />}
                value={`${property.areaSqft.toLocaleString("en-IN")} sqft`}
              />
            )}
            <span className="ml-auto flex items-center gap-1.5">
              <CompareButton propertyId={property.id} />
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  propertyTypeBadgeClass(property.propertyTypeSlug),
                )}
              >
                {property.propertyType}
              </span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function Spec({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-muted-foreground/70">{icon}</span>
      {value}
    </span>
  );
}
