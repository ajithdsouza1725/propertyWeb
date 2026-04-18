import { notFound } from "next/navigation";
import { PublicPropertyCard, type PublicPropertySummary } from "@/components/property/public-property-card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { apiFetch } from "@/lib/api";
import type { PageResponse } from "@/lib/page-response";
import { fetchPublicPropertyTypes } from "@/lib/catalog";

async function getType(slug: string) {
  const all = await fetchPublicPropertyTypes();
  return all.find((t) => t.slug === slug) ?? null;
}

async function getTypeListings(slug: string): Promise<PublicPropertySummary[]> {
  try {
    const res = await apiFetch<PageResponse<PublicPropertySummary>>(
      `/api/public/properties?type=${encodeURIComponent(slug)}&page=0&size=24`
    );
    return res.content ?? [];
  } catch {
    return [];
  }
}

export default async function PropertyTypePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let type: any = null;
  try {
    type = await getType(slug);
  } catch {
    type = null;
  }
  if (!type) notFound();

  const listings = await getTypeListings(slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/listings">Listings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{type.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Property type</Badge>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {type.name} in Mangalore
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          SEO-friendly category page for discovery and targeted browsing.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.length ? (
          listings.map((p) => <PublicPropertyCard key={p.id} property={p} />)
        ) : (
          <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
            No listings yet for {type.name}.
          </div>
        )}
      </div>
    </div>
  );
}

