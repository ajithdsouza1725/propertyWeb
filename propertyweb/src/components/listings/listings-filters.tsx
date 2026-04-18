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
import { RotateCcw, SlidersHorizontal } from "lucide-react";

export function ListingsFilters({
  showPurpose = true,
}: {
  showPurpose?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { localities, propertyTypes } = usePublicCatalog();

  const purposeFromUrl = params.get("purpose");
  const [purpose, setPurpose] = useState(purposeFromUrl ?? "any");
  const [locality, setLocality] = useState(params.get("locality") ?? "any");
  const [type, setType] = useState(params.get("type") ?? "any");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [minBedrooms, setMinBedrooms] = useState(params.get("minBedrooms") ?? "");
  const [minAreaSqft, setMinAreaSqft] = useState(params.get("minAreaSqft") ?? "");

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
    if (showPurpose && purpose !== "any") c += 1;
    if (locality !== "any") c += 1;
    if (type !== "any") c += 1;
    if (q.trim()) c += 1;
    if (minBedrooms.trim()) c += 1;
    if (minAreaSqft.trim()) c += 1;
    return c;
  }, [purpose, locality, type, q, showPurpose, minBedrooms, minAreaSqft]);

  function apply() {
    const next = new URLSearchParams(params.toString());
    if (showPurpose) {
      if (purpose === "any") next.delete("purpose");
      else next.set("purpose", purpose);
    }
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
    const next = new URLSearchParams(params.toString());
    next.delete("purpose");
    next.delete("locality");
    next.delete("type");
    next.delete("q");
    next.delete("minBedrooms");
    next.delete("minAreaSqft");
    next.delete("budget");
    next.delete("minPrice");
    next.delete("maxPrice");
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
    setPurpose("any");
    setLocality("any");
    setType("any");
    setQ("");
    setMinBedrooms("");
    setMinAreaSqft("");
  }

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <div className="text-sm font-semibold tracking-tight">Filters</div>
          {appliedCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary tabular-nums">
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
        {showPurpose ? (
          <div className="grid gap-2">
            <FilterLabel>Purpose</FilterLabel>
            <Select value={purpose} onValueChange={setPurpose}>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}

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

        {type === "residential" ? (
          <div className="grid gap-2">
            <FilterLabel>Min bedrooms</FilterLabel>
            <Input
              inputMode="numeric"
              value={minBedrooms}
              onChange={(e) => setMinBedrooms(e.target.value)}
              placeholder="e.g. 2"
            />
          </div>
        ) : type === "commercial" || type === "land" || type === "agricultural-land" ? (
          <div className="grid gap-2">
            <FilterLabel>Min area (sqft)</FilterLabel>
            <Input
              inputMode="numeric"
              value={minAreaSqft}
              onChange={(e) => setMinAreaSqft(e.target.value)}
              placeholder="e.g. 1000"
            />
          </div>
        ) : null}

        <div className="grid gap-2">
          <FilterLabel>Search</FilterLabel>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. 2 BHK, near Kadri Park…" />
        </div>

        <Button onClick={apply} className="mt-1 h-10 w-full">
          Apply filters{appliedCount ? <span className="ml-1.5 rounded-full bg-primary-foreground/15 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">{appliedCount}</span> : null}
        </Button>
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

