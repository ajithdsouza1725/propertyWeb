"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  popularLocalityItemClass,
  popularLocalitySectionLabelClass,
} from "@/lib/property-type-style";
import { usePublicLocalities } from "@/lib/use-public-localities";
import { Search, MapPin } from "lucide-react";

const TABS = [
  { key: "buy", label: "Buy", activeClass: "bg-teal-600 text-white shadow-md shadow-teal-900/30" },
  { key: "rent", label: "Rent", activeClass: "bg-emerald-600 text-white shadow-md shadow-emerald-900/30" },
  { key: "sell", label: "Sell", activeClass: "bg-[--brand-2] text-white shadow-md shadow-slate-900/25" },
] as const;

const PLACEHOLDERS: Record<string, string> = {
  buy:  "Search 2 BHK, villa, Kadri Park…",
  rent: "Search area, locality, property type…",
  sell: "What kind of property to sell?",
};

export function HeroSearch() {
  const router = useRouter();
  const { localities } = usePublicLocalities();
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
  const [purpose, setPurpose] = useState<"buy" | "sell" | "rent">("buy");
  const [locality, setLocality] = useState<string>("any");
  const [q, setQ] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();
    params.set("purpose", purpose);
    if (locality !== "any") params.set("locality", locality);
    if (q.trim()) params.set("q", q.trim());
    router.push(`/listings?${params.toString()}`);
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white/10 p-1.5 shadow-2xl shadow-black/20 backdrop-blur-xl ring-1 ring-white/20">
      {/* Purpose tabs */}
      <div className="mb-1.5 flex gap-1 rounded-2xl bg-white/10 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setPurpose(t.key)}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold tracking-wide transition-all duration-200 ${
              purpose === t.key
                ? t.activeClass
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search fields */}
      <div className="flex flex-col gap-2 rounded-2xl bg-white p-3 sm:flex-row sm:items-center">
        {/* Text input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            placeholder={PLACEHOLDERS[purpose]}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-11 w-full rounded-xl bg-muted/40 pl-9 pr-4 text-sm outline-none ring-0 transition placeholder:text-muted-foreground/60 focus:bg-muted/60"
          />
        </div>

        {/* Locality */}
        <div className="relative w-full sm:w-48">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground/60" />
          <Select value={locality} onValueChange={setLocality}>
            <SelectTrigger className="h-11 rounded-xl border-0 bg-muted/40 pl-8 text-sm focus:ring-0">
              <SelectValue placeholder="Any locality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any locality</SelectItem>
              {featuredLocalities.length > 0 ? (
                <SelectGroup>
                  <SelectLabel className={popularLocalitySectionLabelClass}>Popular</SelectLabel>
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
                      More areas
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

        {/* CTA */}
        <button
          onClick={handleSearch}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-md shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-px active:translate-y-0"
        >
          <Search className="size-4" />
          Search
        </button>
      </div>
    </div>
  );
}
