import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPropertyCard, type PublicPropertySummary } from "@/components/property/public-property-card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import type { PageResponse } from "@/lib/page-response";
import { fetchPublicLocalities } from "@/lib/catalog";

async function getLocality(slug: string) {
  const all = await fetchPublicLocalities();
  return all.find((l) => l.slug === slug) ?? null;
}

async function getLocalityListings(slug: string): Promise<PublicPropertySummary[]> {
  try {
    const res = await apiFetch<PageResponse<PublicPropertySummary>>(
      `/api/public/properties?locality=${encodeURIComponent(slug)}&page=0&size=24`
    );
    return res.content ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const loc = await getLocality(slug);
  if (!loc) return { title: "Locality Not Found" };
  const title = `Properties in ${loc.name}, Mangalore | MangaloreHomes`;
  const description = `Browse verified properties in ${loc.name}, Mangalore. Apartments, villas, plots and more. Buy, rent or sell on MangaloreHomes.`;
  return { title, description, openGraph: { title, description } };
}

export default async function LocalityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let locality: any = null;
  try {
    locality = await getLocality(slug);
  } catch {
    locality = null;
  }
  if (!locality) notFound();

  const listings = await getLocalityListings(slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/localities">Localities</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{locality.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-4 grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-8">
          <div className="flex flex-wrap items-center gap-2">
            {locality.isFeatured ? <Badge>Featured</Badge> : null}
            <Badge variant="secondary">{locality.city}</Badge>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Properties in {locality.name}
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            This page is designed for SEO + discovery and will later show average prices, landmarks, and FAQs from your CMS tables.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {listings.length ? (
              listings.map((p) => <PublicPropertyCard key={p.id} property={p} />)
            ) : (
              <Card className="border-muted/60 sm:col-span-2">
                <CardContent className="p-6 text-sm text-muted-foreground">
                  No listings yet in {locality.name}.
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <Card className="border-muted/60">
              <CardContent className="p-5">
                <div className="text-sm font-semibold tracking-tight">
                  Quick stats (sample)
                </div>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Active listings</span>
                    <span className="font-medium text-foreground">
                      {listings.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Avg. response</span>
                    <span className="font-medium text-foreground">2–6 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Nearby</span>
                    <span className="font-medium text-foreground">Schools, parks</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-muted/60">
              <CardContent className="p-5">
                <div className="text-sm font-semibold tracking-tight">FAQs (sample)</div>
                <div className="mt-3 space-y-3 text-sm">
                  <div>
                    <div className="font-medium">Is this locality good for families?</div>
                    <div className="text-muted-foreground">
                      Yes — generally preferred due to access to schools and daily essentials.
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">How do I verify a listing?</div>
                    <div className="text-muted-foreground">
                      Look for the Verified badge and request documents during site visit.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}

