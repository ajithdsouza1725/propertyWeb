import { cn } from "@/lib/utils";

type CanonicalType = "residential" | "commercial" | "land" | "agricultural-land" | "other";

/** Normalize slug and map legacy V1 types (apartment, plot, …) to the four active families. */
export function canonicalPropertyTypeSlug(slug: string | null | undefined): CanonicalType {
  const s = String(slug ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
  if (!s) return "other";

  const alias: Record<string, CanonicalType> = {
    apartment: "residential",
    villa: "residential",
    "independent-house": "residential",
    office: "commercial",
    shop: "commercial",
    warehouse: "commercial",
    showroom: "commercial",
    plot: "land",
    agricultural: "agricultural-land",
  };
  if (alias[s]) return alias[s];
  if (s === "residential" || s === "commercial" || s === "land" || s === "agricultural-land") return s;
  return "other";
}

/** Consistent palette by property type slug (residential, commercial, land, agricultural-land). */
export function propertyTypeBadgeClass(slug: string): string {
  const s = canonicalPropertyTypeSlug(slug);
  switch (s) {
    case "residential":
      return "bg-teal-600 text-white shadow-sm ring-1 ring-teal-500/40 dark:bg-teal-600 dark:text-white";
    case "commercial":
      return "bg-violet-600 text-white shadow-sm ring-1 ring-violet-500/40 dark:bg-violet-600 dark:text-white";
    case "land":
      return "bg-amber-600 text-white shadow-sm ring-1 ring-amber-500/40 dark:bg-amber-600 dark:text-white";
    case "agricultural-land":
      return "bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-600/40 dark:bg-emerald-700 dark:text-white";
    default:
      return "bg-slate-600 text-white shadow-sm ring-1 ring-slate-500/40 dark:bg-slate-600 dark:text-white";
  }
}

/** Chip on filters: idle state (outline by type family). */
export function propertyTypeChipIdleClass(slug: string): string {
  const s = canonicalPropertyTypeSlug(slug);
  switch (s) {
    case "residential":
      return "border-teal-300/80 bg-teal-50/80 text-teal-900 hover:bg-teal-100/90 dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-100 dark:hover:bg-teal-900/50";
    case "commercial":
      return "border-violet-300/80 bg-violet-50/80 text-violet-900 hover:bg-violet-100/90 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-100 dark:hover:bg-violet-900/50";
    case "land":
      return "border-amber-300/80 bg-amber-50/80 text-amber-950 hover:bg-amber-100/90 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900/50";
    case "agricultural-land":
      return "border-emerald-300/80 bg-emerald-50/80 text-emerald-950 hover:bg-emerald-100/90 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100 dark:hover:bg-emerald-900/50";
    default:
      return "border-border bg-muted/50 text-foreground hover:bg-muted";
  }
}

export function propertyTypeChipSelectedClass(slug: string): string {
  return cn(propertyTypeBadgeClass(slug), "shadow-md");
}

/** Label for “popular” locality accents (warm coral/amber — distinct from type colors). */
export const popularLocalityItemClass =
  "bg-linear-to-r from-amber-50 to-orange-50 font-semibold text-amber-950 dark:from-amber-950/50 dark:to-orange-950/40 dark:text-amber-50";

export const popularLocalitySectionLabelClass =
  "text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400";
