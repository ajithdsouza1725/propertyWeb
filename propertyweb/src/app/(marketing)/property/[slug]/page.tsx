import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmiCalculator } from "@/components/property/emi-calculator";
import { EnquiryCard } from "@/components/property/enquiry-card";
import { PropertyDetailActions } from "@/components/property/property-detail-actions";
import { PropertyGallery } from "@/components/property/property-gallery";
import { PublicPropertyCard, type PublicPropertySummary } from "@/components/property/public-property-card";
import { TrackPropertyView } from "@/components/property/track-property-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch, mediaAbsoluteUrl } from "@/lib/api";
import type { PageResponse } from "@/lib/page-response";
import { formatINR } from "@/lib/format";
import { SAMPLE_LISTINGS } from "@/lib/sample-data";
import { propertyTypeBadgeClass } from "@/lib/property-type-style";
import { cn } from "@/lib/utils";
import {
  Bath,
  BedDouble,
  Eye,
  MapPin,
  Ruler,
  Car,
  Home,
  Star,
  ShieldCheck,
  ChevronRight,
  Calendar,
  Layers,
  Wind,
  Building2,
  CheckCircle2,
  Phone,
} from "lucide-react";

type PublicPropertyDetails = {
  id: number;
  title: string;
  slug: string;
  purpose: string;
  description: string | null;
  price: number;
  securityDeposit: number | null;
  propertyType: string;
  propertyTypeSlug: string;
  city: string | null;
  addressLine: string | null;
  locality: string | null;
  localitySlug: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  balconies: number | null;
  areaSqft: number | null;
  carpetAreaSqft: number | null;
  furnishingStatus: string | null;
  parkingCount: number | null;
  floorNumber: number | null;
  totalFloors: number | null;
  possessionStatus: string | null;
  isFeatured: boolean;
  isVerified: boolean;
  imageUrls: string[];
  amenities: string[];
  viewsCount: number;
  saved: boolean;
};

function sampleToDetails(s: typeof SAMPLE_LISTINGS[number]): PublicPropertyDetails {
  return {
    id: s.id,
    title: s.title,
    slug: s.slug,
    purpose: s.purpose,
    propertyType: s.propertyType,
    propertyTypeSlug: s.propertyTypeSlug,
    locality: s.locality,
    localitySlug: s.localitySlug,
    price: s.price,
    bedrooms: s.bedrooms,
    bathrooms: s.bathrooms,
    areaSqft: s.areaSqft,
    isFeatured: s.isFeatured,
    isVerified: s.isVerified,
    description: `Beautiful ${s.propertyType.toLowerCase()} located in ${s.locality ?? "Mangalore"}. This verified listing offers excellent value in one of Mangalore's most sought-after neighbourhoods. Contact us directly for a site visit.`,
    addressLine: `${s.locality ?? "Mangalore"}, Karnataka`,
    city: "Mangalore",
    pincode: "575001",
    latitude: null,
    longitude: null,
    furnishingStatus: s.bedrooms ? "semi-furnished" : null,
    parkingCount: s.bedrooms ? 1 : null,
    floorNumber: s.bedrooms ? 3 : null,
    totalFloors: s.bedrooms ? 8 : null,
    possessionStatus: "ready",
    securityDeposit: s.purpose === "rent" ? s.price * 2 : null,
    carpetAreaSqft: s.areaSqft ? Math.round(s.areaSqft * 0.8) : null,
    balconies: s.bedrooms ? Math.min(s.bedrooms, 2) : null,
    imageUrls: s.thumbUrl ? [s.thumbUrl] : [],
    amenities: s.bedrooms ? ["Lift", "Parking", "Security", "Power Backup", "Water Supply"] : ["Road Access", "Water Supply"],
    viewsCount: Math.floor(Math.random() * 200) + 50,
    saved: false,
  };
}

async function getProperty(slug: string): Promise<PublicPropertyDetails | null> {
  try {
    return await apiFetch<PublicPropertyDetails>(`/api/public/properties/${slug}`);
  } catch {
    // Fallback to sample data
    const sample = SAMPLE_LISTINGS.find((s) => s.slug === slug);
    return sample ? sampleToDetails(sample) : null;
  }
}

async function getSimilar(p: PublicPropertyDetails): Promise<PublicPropertySummary[]> {
  try {
    const params = new URLSearchParams();
    if (p.purpose) params.set("purpose", String(p.purpose).toLowerCase());
    if (p.localitySlug) params.set("locality", p.localitySlug);
    params.set("page", "0");
    params.set("size", "12");
    const res = await apiFetch<PageResponse<PublicPropertySummary>>(`/api/public/properties?${params.toString()}`);
    return (res.content ?? []).filter((x) => x.slug !== p.slug).slice(0, 3);
  } catch {
    // Fallback to sample data
    const purpose = String(p.purpose ?? "").toLowerCase();
    return (SAMPLE_LISTINGS as PublicPropertySummary[])
      .filter((x) => x.slug !== p.slug && x.purpose === purpose)
      .slice(0, 3);
  }
}

function SpecItem({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border bg-muted/20 p-3 text-center">
      <div className="text-muted-foreground">{icon}</div>
      <div className="text-sm font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProperty(slug);
  if (!p) return { title: "Property Not Found" };

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const title = `${p.title}${p.locality ? ` in ${p.locality}` : ""}, Mangalore | MangaloreHomes`;
  const description = (p.description ?? "").slice(0, 160) || `${p.title} — verified property listing on MangaloreHomes.`;
  const ogImage = p.imageUrls?.[0] ? mediaAbsoluteUrl(p.imageUrls[0]) : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/property/${p.slug}`,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

export default async function PropertyDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) notFound();

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description ?? "",
    url: `${siteUrl}/property/${slug}`,
    image: property.imageUrls?.[0] ? mediaAbsoluteUrl(property.imageUrls[0]) : "",
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "INR",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: property.locality ?? "Mangalore",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
  };

  const purpose = String(property.purpose ?? "").toLowerCase();
  const isRent = purpose === "rent";
  const similar = await getSimilar(property);

  const imgs = Array.isArray(property.imageUrls) ? property.imageUrls : [];
  const amenityList = Array.isArray(property.amenities) ? property.amenities : [];
  const siteBase = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const shareUrl = `${siteBase}/property/${property.slug}`;
  const mapHref =
    property.latitude != null && property.longitude != null
      ? `https://www.google.com/maps?q=${property.latitude},${property.longitude}`
      : null;

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Track this view in localStorage for "recently viewed" */}
      <TrackPropertyView slug={property.slug} title={property.title} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="border-b bg-surface">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-3 text-xs text-muted-foreground">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
            <Home className="size-3.5" /> Home
          </Link>
          <ChevronRight className="size-3.5 text-muted-foreground/50" />
          <Link href="/listings" className="hover:text-foreground">Properties</Link>
          <ChevronRight className="size-3.5 text-muted-foreground/50" />
          <span className="line-clamp-1 font-medium text-foreground">{property.title}</span>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-8 lg:grid-cols-12">

          {/* ── LEFT COLUMN ──────────────────────────────── */}
          <section className="space-y-6 lg:col-span-8">

            {/* Gallery with lightbox */}
            <PropertyGallery images={imgs} title={property.title} />

            {/* Title & Price */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={isRent ? "bg-emerald-600 text-white border-0" : "bg-primary text-white border-0"}>
                    {isRent ? "Rent" : "Buy"}
                  </Badge>
                  {property.isFeatured && (
                    <Badge className="bg-amber-500 text-white border-0 gap-1">
                      <Star className="size-3" /> Featured
                    </Badge>
                  )}
                  {property.isVerified && (
                    <Badge variant="secondary" className="gap-1 text-emerald-700">
                      <ShieldCheck className="size-3" /> Verified
                    </Badge>
                  )}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="size-3.5" /> {property.viewsCount ?? 0} views
                  </span>
                </div>
                <h1 className="text-2xl font-black tracking-tight md:text-3xl">{property.title}</h1>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4 shrink-0" />
                  <span>
                    {[property.addressLine, property.locality, property.city].filter(Boolean).join(", ") || "Mangalore"}
                  </span>
                </div>
              </div>
              <PropertyDetailActions
                propertyId={Number(property.id)}
                initialSaved={Boolean(property.saved)}
                shareTitle={property.title}
                shareUrl={shareUrl}
              />
            </div>

            {/* Key Specs */}
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              <SpecItem icon={<BedDouble className="size-5" />} label="Bedrooms" value={property.bedrooms != null ? `${property.bedrooms} BHK` : null} />
              <SpecItem icon={<Bath className="size-5" />} label="Bathrooms" value={property.bathrooms != null ? `${property.bathrooms}` : null} />
              <SpecItem icon={<Ruler className="size-5" />} label="Area" value={property.areaSqft != null ? `${property.areaSqft.toLocaleString("en-IN")} sqft` : null} />
              <SpecItem icon={<Car className="size-5" />} label="Parking" value={property.parkingCount ?? null} />
              <SpecItem icon={<Layers className="size-5" />} label="Floor" value={property.floorNumber != null ? `${property.floorNumber}/${property.totalFloors ?? "?"}` : null} />
              <SpecItem icon={<Wind className="size-5" />} label="Furnishing" value={property.furnishingStatus} />
            </div>

            {/* Price card (mobile) */}
            <div className="rounded-2xl border bg-linear-to-br from-primary/5 to-primary/10 p-5 lg:hidden">
              <div className="text-sm text-muted-foreground">{isRent ? "Monthly Rent" : "Price"}</div>
              <div className="mt-1 text-3xl font-bold text-primary">
                {formatINR(property.price)}
                {isRent && <span className="text-base font-normal text-primary/70">/mo</span>}
              </div>
              {isRent && property.securityDeposit && (
                <div className="mt-1 text-sm text-muted-foreground">Deposit: {formatINR(property.securityDeposit)}</div>
              )}
              {property.areaSqft && !isRent && (
                <div className="mt-1 text-sm text-muted-foreground">
                  ₹{Math.round(Number(property.price) / Number(property.areaSqft)).toLocaleString("en-IN")}/sqft
                </div>
              )}
            </div>

            {/* Description */}
            {property.description && (
              <div>
                <h2 className="mb-3 text-lg font-black tracking-tight">About this property</h2>
                <p className="leading-relaxed text-muted-foreground">{property.description}</p>
              </div>
            )}

            {/* Property Details Table */}
            <div>
              <h2 className="mb-3 text-lg font-black tracking-tight">Property details</h2>
              <div className="rounded-2xl border overflow-hidden">
                {(
                  [
                    { label: "Property Type", value: property.propertyType, slug: property.propertyTypeSlug },
                    { label: "Purpose", value: property.purpose?.toLowerCase() },
                    {
                      label: "Carpet Area",
                      value: property.carpetAreaSqft ? `${property.carpetAreaSqft.toLocaleString("en-IN")} sqft` : null,
                    },
                    { label: "Possession Status", value: property.possessionStatus },
                    { label: "Pincode", value: property.pincode },
                    { label: "City", value: property.city },
                  ] as const
                )
                  .filter((r) => r.value)
                  .map((r, i) => (
                    <div
                      key={r.label}
                      className={`flex items-center justify-between px-4 py-3 text-sm ${i % 2 === 0 ? "bg-muted/20" : "bg-background"}`}
                    >
                      <span className="text-muted-foreground">{r.label}</span>
                      {"slug" in r && r.slug != null ? (
                        <span
                          className={cn(
                            "font-semibold capitalize",
                            propertyTypeBadgeClass(String(r.slug))
                          )}
                        >
                          {r.value}
                        </span>
                      ) : (
                        <span className="font-medium capitalize">{r.value}</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Amenities */}
            {amenityList.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-black tracking-tight">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {amenityList.map((a) => (
                    <div key={a} className="flex items-center gap-1.5 rounded-xl border bg-muted/20 px-3 py-1.5 text-sm">
                      <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location + Google Maps embed */}
            <div>
              <h2 className="mb-3 text-lg font-black tracking-tight">Location</h2>
              <div className="rounded-2xl border overflow-hidden">
                {/* Map embed — uses lat/lng if available, otherwise locality name */}
                <div className="aspect-video w-full bg-muted">
                  <iframe
                    title="Property location"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={
                      property.latitude != null && property.longitude != null
                        ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ""}&q=${property.latitude},${property.longitude}&zoom=15`
                        : `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ""}&q=${encodeURIComponent((property.locality ?? "Mangalore") + ", Mangalore, Karnataka")}&zoom=13`
                    }
                    allowFullScreen
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="size-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium">{property.locality ?? "Mangalore"}</div>
                      {property.addressLine && (
                        <div className="mt-0.5 text-sm text-muted-foreground">{property.addressLine}</div>
                      )}
                    </div>
                  </div>
                  {mapHref && (
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                      <a href={mapHref} target="_blank" rel="noopener noreferrer">
                        <MapPin className="size-3.5 mr-1.5" /> Open in Google Maps
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Similar properties */}
            {similar.length > 0 && (
              <div>
                <div className="mb-4 flex items-end justify-between gap-3">
                  <h2 className="text-lg font-black tracking-tight">Similar properties</h2>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/listings">View all <ChevronRight className="size-3.5 ml-1" /></Link>
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {similar.map((p) => (
                    <PublicPropertyCard key={p.id} property={p} />
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ── RIGHT SIDEBAR ─────────────────────────────── */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              {/* Price card (desktop) */}
              <div className="hidden rounded-2xl border bg-linear-to-br from-primary/5 to-primary/10 p-5 lg:block">
                <div className="text-sm text-muted-foreground">{isRent ? "Monthly Rent" : "Price"}</div>
                <div className="mt-1 text-3xl font-bold text-primary">
                  {formatINR(property.price)}
                  {isRent && <span className="text-base font-normal text-primary/70">/mo</span>}
                </div>
                {isRent && property.securityDeposit && (
                  <div className="mt-1 text-sm text-muted-foreground">Deposit: {formatINR(property.securityDeposit)}</div>
                )}
                {property.areaSqft && !isRent && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    ₹{Math.round(Number(property.price) / Number(property.areaSqft)).toLocaleString("en-IN")}/sqft
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {property.bedrooms != null && <span className="flex items-center gap-1"><BedDouble className="size-3.5" />{property.bedrooms} BHK</span>}
                  {property.bathrooms != null && <span className="flex items-center gap-1"><Bath className="size-3.5" />{property.bathrooms} Bath</span>}
                  {property.areaSqft != null && <span className="flex items-center gap-1"><Ruler className="size-3.5" />{property.areaSqft.toLocaleString("en-IN")} sqft</span>}
                </div>
              </div>

              {/* Enquiry form */}
              <EnquiryCard
                propertyId={Number(property.id)}
                propertySlug={property.slug}
                propertyTitle={property.title}
              />

              {/* EMI calculator — only for buy/sell properties, not rentals */}
              {!isRent && property.price > 0 && (
                <EmiCalculator propertyPrice={Number(property.price)} />
              )}

              {/* Trust box */}
              <div className="rounded-2xl border bg-muted/10 p-4">
                <div className="mb-3 text-sm font-semibold">Why enquire through us?</div>
                <div className="space-y-2">
                  {[
                    { icon: ShieldCheck, text: "Verified seller & listing" },
                    { icon: Building2, text: "Admin team verifies before connecting" },
                    { icon: Phone, text: "Quick response, no spam" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.text} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon className="size-3.5 text-emerald-500 shrink-0" />
                        {item.text}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
