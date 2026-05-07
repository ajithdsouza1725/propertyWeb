"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  popularLocalityItemClass,
  popularLocalitySectionLabelClass,
  propertyTypeChipIdleClass,
  propertyTypeChipSelectedClass,
} from "@/lib/property-type-style";
import { usePublicCatalog } from "@/lib/use-public-catalog";
import { cn } from "@/lib/utils";
import {
  RotateCcw,
  SlidersHorizontal,
  Home,
  Key,
  LandPlot,
  Layers,
} from "lucide-react";

/* ── Quick-filter categories ──────────────────────── */
const CATEGORIES = [
  { key: "all",   label: "All",   icon: Layers,   purpose: "",     type: ""     },
  { key: "buy",   label: "Buy",   icon: Home,     purpose: "buy",  type: ""     },
  { key: "rent",  label: "Rent",  icon: Key,      purpose: "rent", type: ""     },
  { key: "plots", label: "Plots", icon: LandPlot, purpose: "buy",  type: "plot" },
] as const;

function detectActiveCategory(purpose: string, type: string): string {
  if (type === "plot") return "plots";
  if (purpose === "rent") return "rent";
  if (purpose === "buy") return "buy";
  return "all";
}

export function ListingsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { localities, propertyTypes } = usePublicCatalog();

  const purposeFromUrl = params.get("purpose") ?? "";
  const typeFromUrl = params.get("type") ?? "";

  const [locality, setLocality] = useState(params.get("locality") ?? "any");
  const [type, setType] = useState(typeFromUrl || "any");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [minBedrooms, setMinBedrooms] = useState(params.get("minBedrooms") ?? "");
  const [minAreaSqft, setMinAreaSqft] = useState(params.get("minAreaSqft") ?? "");

  const activeCategory = detectActiveCategory(purposeFromUrl, typeFromUrl);

  const featuredLocalities = useMemo(
    () =>
      [...localities]
        .filter((l) => l.isFeatured)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [localities]
  );
  const otherLocalities = useMemo(
    () =>
      [...localities]
        .filter((l) => !l.isFeatured)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [localities]
  );

  const appliedCount = useMemo(() => {
    let c = 0;
    if (locality !== "any") c += 1;
    if (type !== "any" && type !== typeFromUrl) c += 1;
    if (q.trim()) c += 1;
    if (minBedrooms.trim()) c += 1;
    if (minAreaSqft.trim()) c += 1;
    return c;
  }, [locality, type, q, minBedrooms, minAreaSqft, typeFromUrl]);

  /** Instant navigate on category click — no "Apply" needed */
  function selectCategory(cat: (typeof CATEGORIES)[number]) {
    const next = new URLSearchParams();
    if (cat.purpose) next.set("purpose", cat.purpose);
    if (cat.type) next.set("type", cat.type);
    // Preserve locality if set
    if (locality !== "any") next.set("locality", locality);
    if (q.trim()) next.set("q", q.trim());
    router.push(`${pathname}?${next.toString()}`);
  }

  function apply() {
    const next = new URLSearchParams(params.toString());
    if (locality === "any") next.delete("locality");
    else next.set("locality", locality);
    if (type === "any") next.delete("type");
    else next.set("type", type);
    if (!q.trim()) next.delete("q");
    else next.set("q", q.trim());
    if (!minBedrooms.trim()) next.delete("minBedrooms");
    else next.set("minBedrooms", minBedrooms.trim());
    if (!minAreaSqft.trim()) next.delete("minAreaSqft");
    else next.set("minAreaSqft", minAreaSqft.trim());
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  function reset() {
    const next = new URLSearchParams();
    router.push(pathname);
    setLocality("any");
    setType("any");
    setQ("");
    setMinBedrooms("");
    setMinAreaSqft("");
  }

  return (
    <div className="space-y-4">
      {/* ── Quick Category Toggle — instant, no "Apply" ── */}
      <div className="rounded-2xl border bg-card p-3 shadow-card">
        <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          I want to
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => selectCategory(cat)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl py-3 text-xs font-semibold transition-all",
                  active
                    ? cat.key === "rent"
                      ? "bg-emerald-600 text-white shadow-md"
                      : cat.key === "plots"
                        ? "bg-amber-600 text-white shadow-md"
                        : "bg-primary text-white shadow-md"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Detailed Filters ── */}
      <div className="rounded-2xl border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            <div className="text-sm font-semibold tracking-tight">Filters</div>
            {appliedCount > 0 && (
              <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary tabular-nums">
                {appliedCount}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-muted-foreground">
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        </div>
        <Separator className="my-4" />

        <div className="grid gap-4">
          <div className="grid gap-2">
            <FilterLabel>Locality</FilterLabel>
            <Select value={locality} onValueChange={setLocality}>
              <SelectTrigger>
                <SelectValue placeholder="Any locality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any locality</SelectItem>
                {featuredLocalities.length > 0 ? (
                  <SelectGroup>
                    <SelectLabel className={popularLocalitySectionLabelClass}>Popular localities</SelectLabel>
                    {featuredLocalities.map((l) => (
                      <SelectItem key={l.id} value={l.slug} className={popularLocalityItemClass}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ) : null}
                {featuredLocalities.length > 0 && otherLocalities.length > 0 ? <SelectSeparator /> : null}
                {otherLocalities.length > 0 ? (
                  <SelectGroup>
                    {featuredLocalities.length > 0 ? (
                      <SelectLabel className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        All areas
                      </SelectLabel>
                    ) : null}
                    {otherLocalities.map((l) => (
                      <SelectItem key={l.id} value={l.slug}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ) : null}
              </SelectContent>
            </Select>
          </div>

          {/* Only show property type chips when NOT in "plots" mode */}
          {activeCategory !== "plots" && (
            <div className="grid gap-2">
              <FilterLabel>Property type</FilterLabel>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setType("any")}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    type === "any"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  All types
                </button>
                {propertyTypes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.slug)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                      type === t.slug ? propertyTypeChipSelectedClass(t.slug) : propertyTypeChipIdleClass(t.slug)
                    )}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(type === "residential" || activeCategory === "buy") && (
            <div className="grid gap-2">
              <FilterLabel>Min bedrooms</FilterLabel>
              <div className="flex gap-1.5">
                {["", "1", "2", "3", "4"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setMinBedrooms(v)}
                    className={cn(
                      "flex-1 rounded-lg border py-2 text-xs font-semibold transition",
                      minBedrooms === v
                        ? "border-primary bg-primary text-white"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {v ? `${v}+` : "Any"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(type === "commercial" || type === "land" || type === "agricultural-land" || activeCategory === "plots") && (
            <div className="grid gap-2">
              <FilterLabel>Min area (sqft)</FilterLabel>
              <Input
                inputMode="numeric"
                value={minAreaSqft}
                onChange={(e) => setMinAreaSqft(e.target.value)}
                placeholder="e.g. 1000"
              />
            </div>
          )}

          <div className="grid gap-2">
            <FilterLabel>Search</FilterLabel>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && apply()}
              placeholder="e.g. 2 BHK, near Kadri Park…"
            />
          </div>

          <Button onClick={apply} className="mt-1 h-10 w-full">
            Apply filters
            {appliedCount > 0 && (
              <span className="ml-1.5 rounded-full bg-primary-foreground/15 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
                {appliedCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}
