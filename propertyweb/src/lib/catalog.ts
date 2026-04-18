import { apiFetch } from "@/lib/api";

export type PublicLocality = {
  id: number;
  city: string;
  name: string;
  slug: string;
  isFeatured?: boolean;
};

export type PublicPropertyType = {
  id: number;
  name: string;
  slug: string;
};

export async function fetchPublicLocalities() {
  return await apiFetch<PublicLocality[]>("/api/public/localities");
}

export async function fetchPublicPropertyTypes() {
  return await apiFetch<PublicPropertyType[]>("/api/public/property-types");
}

