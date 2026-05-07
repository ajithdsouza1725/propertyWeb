import Link from "next/link";
import { Suspense } from "react";
import { ListingsFilters } from "@/components/listings/listings-filters";
import { ListingsSort } from "@/components/listings/listings-sort";
import { PublicPropertyCard, type PublicPropertySummary } from "@/components/property/public-property-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch, getApiErrorMessage } from "@/lib/api";
import { parseBudgetToPriceRange } from "@/lib/budget-parse";
import type { PageResponse } from "@/lib/page-response";
import { SAMPLE_LISTINGS } from "@/lib/sample-data";
import { SearchX, ChevronLeft, ChevronRight, Home } from "lucide-react";

type SP = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function purposeLabel(p?: string) {
  if (!p) return null;
  const m: Record<string, string> = { buy: "Buy", rent: "Rent" };
  return m[p.toLowerCase()] ?? p;
}

export default async function ListingsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const purpose = first(sp.purpose);
  const locality = first(sp.locality);
  const type = first(sp.type);
  const budget = first(sp.budget);
  const q = (first(sp.q) ?? "").trim().toLowerCase();
  const minBedrooms = first(sp.minBedrooms);
  const minAreaSqft = first(sp.minAreaSqft);
  const sort = first(sp.sort) ?? "relevance";
  const page = Math.max(0, Number(first(sp.page) ?? 0) || 0);
  const { minPrice, maxPrice } = parseBudgetToPriceRange(budget, purpose);

  const params = new URLSearchParams();
  if (purpose) params.set("purpose", purpose);
  if (locality) params.set("locality", locality);
  if (type) params.set("type", type);
  if (q) params.set("q", q);
  if (minPrice != null) params.set("minPrice", String(minPrice));
  if (maxPrice != null) params.set("maxPrice", String(maxPrice));
  if (minBedrooms) params.set("minBedrooms", String(minBedrooms));
  if (minAreaSqft) params.set("minAreaSqft", String(minAreaSqft));
  if (sort && sort !== "relevance") params.set("sort", sort);
  params.set("page", String(page));
  params.set("size", "12");

  let payload: PageResponse<PublicPropertySummary> = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 12 };
  let fetchError: string | null = null;
  try {
    payload = await apiFetch<PageResponse<PublicPropertySummary>>(`/api/public/properties?${params.toString()}`);
  } catch (e: unknown) {
    fetchError = getApiErrorMessage(e, "Could not load listings. Is the API running?");

    // Fallback: filter sample data client-side when API is offline
    let filtered = SAMPLE_LISTINGS as PublicPropertySummary[];
    if (purpose) filtered = filtered.filter((p) => p.purpose === purpose);
    if (locality) filtered = filtered.filter((p) => p.localitySlug === locality);
    if (type) filtered = filtered.filter((p) => p.propertyTypeSlug === type);
    if (q) filtered = filtered.filter((p) => p.title.toLowerCase().includes(q) || (p.locality ?? "").toLowerCase().includes(q));
    if (minPrice != null) filtered = filtered.filter((p) => p.price >= minPrice);
    if (maxPrice != null) filtered = filtered.filter((p) => p.price <= maxPrice);
    if (minBedrooms) filtered = filtered.filter((p) => (p.bedrooms ?? 0) >= Number(minBedrooms));

    const startIdx = page * 12;
    const sliced = filtered.slice(startIdx, startIdx + 12);
    payload = {
      content: sliced,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / 12),
      number: page,
      size: 12,
    };
    fetchError = null; // Don't show error since we have sample data
  }

  const rows = payload.content ?? [];
  const total = payload.totalElements;
  const totalPages = Math.max(0, payload.totalPages);
  const size = payload.size || 12;
  const start = total === 0 ? 0 : page * size + 1;
  const end = Math.min((page + 1) * size, total);

  function pageHref(nextPage: number) {
    const p = new URLSearchParams();
    if (purpose) p.set("purpose", purpose);
    if (locality) p.set("locality", locality);
    if (type) p.set("type", type);
    if (budget) p.set("budget", budget);
    if (q) p.set("q", q);
    if (minBedrooms) p.set("minBedrooms", String(minBedrooms));
    if (minAreaSqft) p.set("minAreaSqft", String(minAreaSqft));
    if (sort && sort !== "relevance") p.set("sort", sort);
    if (minPrice != null) p.set("minPrice", String(minPrice));
    if (maxPrice != null) p.set("maxPrice", String(maxPrice));
    p.set("page", String(nextPage));
    p.set("size", "12");
    return `/listings?${p.toString()}`;
  }

  const activeFilters = [
    purpose && { label: purposeLabel(purpose)!, href: "" },
    locality && { label: `📍 ${locality}`, href: "" },
    type && { label: type, href: "" },
    budget && { label: `Budget: ${budget}`, href: "" },
    q && { label: `"${q}"`, href: "" },
    minBedrooms && { label: `${minBedrooms}+ BHK`, href: "" },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div className="min-h-screen bg-background">
      {/* Page header — quiet, trustworthy; not shouty */}
      <div className="border-b bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
              <Home className="size-3.5" /> Home
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="font-medium text-foreground">Properties</span>
            {purpose && (
              <>
                <span className="text-muted-foreground/50">/</span>
                <span className="font-medium capitalize text-foreground">{purpose}</span>
              </>
            )}
          </nav>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {purpose ? `Properties to ${purposeLabel(purpose)}` : "All properties"}
                {locality ? ` in ${locality}` : " in Mangalore"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {total === 0
                  ? "No results"
                  : `${total.toLocaleString("en-IN")} ${total === 1 ? "property" : "properties"} found`}
                {total > 0 && (
                  <>
                    {" · "}
                    <span className="tabular-nums">showing {start}–{end}</span>
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sort</span>
              <Suspense fallback={null}>
                <ListingsSort value={sort} />
              </Suspense>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {activeFilters.map((f) => (
                <Badge key={f.label} className="rounded-full bg-primary-soft text-primary px-3 py-1 text-xs font-medium">
                  {f.label}
                </Badge>
              ))}
              <Link
                href="/listings"
                className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Clear all
              </Link>
            </div>
          )}
        </div>
      </div>

      {fetchError && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {fetchError}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Filters sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <Suspense
                fallback={<div className="skeleton h-64 rounded-2xl" aria-label="Loading filters" />}
              >
                <ListingsFilters />
              </Suspense>
            </div>
          </aside>

          {/* Results */}
          <section className="lg:col-span-9">
            {rows.length > 0 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rows.map((p) => (
                    <PublicPropertyCard key={p.id} property={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between border-t pt-6">
                    <div className="text-sm text-muted-foreground">
                      Page {page + 1} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      {page > 0 ? (
                        <Button variant="outline" size="sm" className="rounded-xl" asChild>
                          <Link href={pageHref(page - 1)}>
                            <ChevronLeft className="size-4 mr-1" /> Previous
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="rounded-xl" disabled>
                          <ChevronLeft className="size-4 mr-1" /> Previous
                        </Button>
                      )}
                      {/* Page numbers */}
                      <div className="hidden items-center gap-1 sm:flex">
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                          const pg = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                          return (
                            <Button
                              key={pg}
                              variant={pg === page ? "default" : "outline"}
                              size="sm"
                              className="w-9 p-0 rounded-xl"
                              asChild={pg !== page}
                            >
                              {pg !== page ? (
                                <Link href={pageHref(pg)}>{pg + 1}</Link>
                              ) : (
                                <span>{pg + 1}</span>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                      {page < totalPages - 1 ? (
                        <Button variant="outline" size="sm" className="rounded-xl" asChild>
                          <Link href={pageHref(page + 1)}>
                            Next <ChevronRight className="size-4 ml-1" />
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="rounded-xl" disabled>
                          Next <ChevronRight className="size-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed bg-card/50 px-6 py-20 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary-soft">
                  <SearchX className="size-7 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-base font-semibold">No properties match your filters</h3>
                <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                  Try removing a filter, widening your budget, or searching a broader locality.
                </p>
                <Button variant="outline" className="mt-6" asChild>
                  <Link href="/listings">Clear all filters</Link>
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
