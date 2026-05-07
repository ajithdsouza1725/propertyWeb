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

const purposeBadgeClass: Record<string, string> = {
  buy: "bg-primary text-white",
  rent: "bg-emerald-600 text-white",
  sell: "bg-amber-600 text-white",
};

export function PublicPropertyCard({ property }: { property: PublicPropertySummary }) {
  const purpose = String(property.purpose ?? "").toLowerCase();
  const isRent = purpose === "rent";
  const thumbSrc = property.thumbUrl ? mediaAbsoluteUrl(property.thumbUrl) : null;
  const label = purposeLabel[purpose] ?? "Buy";

  const showFeatured = property.isFeatured;
  const showVerified = property.isVerified && !showFeatured;

  return (
    <Link
      href={`/property/${property.slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
      aria-label={`${property.title} — ${formatCompactINR(Number(property.price ?? 0))}${isRent ? " per month" : ""}`}
    >
      <article className="card-hover rounded-2xl border bg-card shadow-card">
        {/* Image section */}
        <div className="relative aspect-4/3 overflow-hidden rounded-t-2xl">
          {thumbSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbSrc}
              alt={property.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Home className="size-10 text-muted-foreground/40" strokeWidth={1.25} />
            </div>
          )}

          {/* Bottom scrim */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent"
          />

          {/* Top-left: Purpose badge */}
          <span
            className={cn(
              "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
              purposeBadgeClass[purpose] ?? "bg-primary text-white",
            )}
          >
            {label}
          </span>

          {/* Top-right: ONE badge only — Featured > Verified */}
          {showFeatured && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
              <Star className="size-3 fill-current" />
              Featured
            </span>
          )}
          {showVerified && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              <ShieldCheck className="size-3" />
              Verified
            </span>
          )}

          {/* Price overlay on scrim */}
          <div className="absolute bottom-4 left-4">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black tabular-nums text-white">
                {formatCompactINR(Number(property.price ?? 0))}
              </span>
              {isRent && <span className="text-xs text-white/80">/mo</span>}
            </div>
            {property.locality && (
              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-white/75">
                <MapPin className="size-3" />
                <span className="line-clamp-1">{property.locality}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card body */}
        <div className="p-4">
          <h3 className="line-clamp-2 min-h-[2.5em] text-[15px] font-semibold leading-snug transition-colors group-hover:text-primary">
            {property.title}
          </h3>

          {/* Specs row */}
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
            {/* Footer */}
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
