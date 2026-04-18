import { LocalityCard } from "@/components/locality/locality-card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { fetchPublicLocalities } from "@/lib/catalog";

async function getLocalities() {
  try {
    return await fetchPublicLocalities();
  } catch {
    return [];
  }
}

export default async function LocalitiesPage() {
  const raw = await getLocalities();
  const localities = [...raw].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Localities</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-4">
        <h1 className="text-2xl font-semibold tracking-tight">Localities in Mangalore</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Explore locality pages for SEO-friendly browsing and quick discovery.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {localities.map((l) => (
          <LocalityCard key={l.id} locality={{ city: l.city, name: l.name, slug: l.slug, isFeatured: l.isFeatured }} />
        ))}
      </div>
    </div>
  );
}

