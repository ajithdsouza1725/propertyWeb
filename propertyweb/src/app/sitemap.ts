import type { MetadataRoute } from "next";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type Property = { slug: string; updatedAt?: string };
type Locality = { slug: string };

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [] as unknown as T;
  return res.json();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.replace(/\/$/, "");

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/listings`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/listings?purpose=buy`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/listings?purpose=rent`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/localities`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/signup`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Dynamic property pages
  let propertyPages: MetadataRoute.Sitemap = [];
  try {
    const data = await fetchJson<{ content: Property[] }>("/api/public/properties?size=500");
    const props = Array.isArray(data?.content) ? data.content : [];
    propertyPages = props.map((p) => ({
      url: `${base}/property/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {}

  // Dynamic locality pages
  let localityPages: MetadataRoute.Sitemap = [];
  try {
    const locs = await fetchJson<Locality[]>("/api/public/localities");
    if (Array.isArray(locs)) {
      localityPages = locs.map((l) => ({
        url: `${base}/listings?locality=${l.slug}`,
        changeFrequency: "daily" as const,
        priority: 0.7,
      }));
    }
  } catch {}

  return [...staticPages, ...propertyPages, ...localityPages];
}
