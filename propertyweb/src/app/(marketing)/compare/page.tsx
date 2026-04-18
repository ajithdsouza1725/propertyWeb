"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch, mediaAbsoluteUrl } from "@/lib/api";
import { formatINR, formatCompactINR } from "@/lib/format";
import { getCompareIds, clearCompare, removeFromCompare } from "@/lib/compare";
import { ArrowLeft, X, Home, BedDouble, Bath, Maximize2, Car, MapPin } from "lucide-react";

type PropertyDetail = {
  id: number;
  title: string;
  slug: string;
  purpose: string;
  price: number;
  propertyType: string | null;
  locality: string | null;
  city: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqft: number | null;
  parkingCount: number | null;
  furnishingStatus: string | null;
  possessionStatus: string | null;
  imageUrls: string[];
};

const ROWS: { label: string; render: (p: PropertyDetail) => string }[] = [
  { label: "Price", render: (p) => formatINR(p.price) },
  { label: "Price/sqft", render: (p) => p.areaSqft ? `₹${Math.round(p.price / p.areaSqft).toLocaleString("en-IN")}` : "—" },
  { label: "Type", render: (p) => p.propertyType ?? "—" },
  { label: "Purpose", render: (p) => (p.purpose ?? "").toLowerCase() },
  { label: "Locality", render: (p) => p.locality ?? "—" },
  { label: "Bedrooms", render: (p) => p.bedrooms != null ? String(p.bedrooms) : "—" },
  { label: "Bathrooms", render: (p) => p.bathrooms != null ? String(p.bathrooms) : "—" },
  { label: "Area", render: (p) => p.areaSqft ? `${p.areaSqft.toLocaleString("en-IN")} sqft` : "—" },
  { label: "Parking", render: (p) => p.parkingCount != null ? String(p.parkingCount) : "—" },
  { label: "Furnishing", render: (p) => p.furnishingStatus ?? "—" },
  { label: "Possession", render: (p) => p.possessionStatus ?? "—" },
];

export default function ComparePage() {
  const [properties, setProperties] = useState<PropertyDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = getCompareIds();
    if (ids.length === 0) { setLoading(false); return; }
    setLoading(true);
    Promise.all(
      ids.map((id) =>
        apiFetch<PropertyDetail>(`/api/public/properties/${id}`)
          .catch(() => null)
      )
    ).then((results) => {
      setProperties(results.filter(Boolean) as PropertyDetail[]);
      setLoading(false);
    });
  }, []);

  // Try fetching by slug from the public list if direct ID fetch fails
  useEffect(() => {
    const ids = getCompareIds();
    if (ids.length === 0) { setLoading(false); return; }
    setLoading(true);
    // Fetch all properties in one call then filter
    apiFetch<{ content: PropertyDetail[] }>("/api/public/properties?size=500")
      .then((data) => {
        const all = data.content ?? [];
        const matched = ids.map((id) => all.find((p) => p.id === id)).filter(Boolean) as PropertyDetail[];
        setProperties(matched);
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-muted-foreground">
        Loading comparison…
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <Home className="mx-auto size-12 text-muted-foreground/40" />
        <h1 className="mt-4 text-xl font-black">No properties to compare</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse listings and click the "Compare" button on up to 3 properties.
        </p>
        <Button asChild className="mt-6">
          <Link href="/listings">Browse listings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/listings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="size-3.5" /> Back to listings
          </Link>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">Compare properties</h1>
          <p className="mt-1 text-sm text-muted-foreground">{properties.length} properties selected</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { clearCompare(); setProperties([]); }}>
          Clear all
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse">
          {/* Property header row — photos + titles */}
          <thead>
            <tr>
              <th className="w-40 p-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground align-bottom">
                Property
              </th>
              {properties.map((p) => (
                <th key={p.id} className="p-3 text-left align-bottom">
                  <div className="relative">
                    <button
                      onClick={() => { removeFromCompare(p.id); setProperties((prev) => prev.filter((x) => x.id !== p.id)); }}
                      className="absolute -right-1 -top-1 rounded-full bg-muted p-1 text-muted-foreground hover:bg-destructive hover:text-white"
                      aria-label="Remove"
                    >
                      <X className="size-3" />
                    </button>
                    {p.imageUrls?.[0] ? (
                      <img src={mediaAbsoluteUrl(p.imageUrls[0])} alt="" className="mb-2 h-28 w-full rounded-xl border object-cover" />
                    ) : (
                      <div className="mb-2 flex h-28 items-center justify-center rounded-xl border bg-muted">
                        <Home className="size-8 text-muted-foreground/40" />
                      </div>
                    )}
                    <Link href={`/property/${p.slug}`} className="text-sm font-bold hover:text-primary transition-colors line-clamp-2">
                      {p.title}
                    </Link>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" /> {p.locality ?? p.city ?? "Mangalore"}
                    </div>
                    <div className="mt-1 text-lg font-black text-primary tabular-nums">
                      {formatCompactINR(p.price)}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Comparison rows */}
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                <td className="p-3 text-xs font-semibold text-muted-foreground">{row.label}</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-3 text-sm font-medium">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex gap-3">
        {properties.map((p) => (
          <Button key={p.id} asChild variant="outline" className="flex-1">
            <Link href={`/property/${p.slug}`}>View {p.title.slice(0, 20)}…</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
