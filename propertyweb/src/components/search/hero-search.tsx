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
import { Search, MapPin, ArrowRight, Home, Key, LandPlot } from "lucide-react";

/* ── Tab config ────────────────────────────────────────
   Buy  = homes/apartments/villas/commercial for purchase
   Rent = rental properties
   Plots = land/plots                                    */
const TABS = [
  {
    key: "buy",
    label: "Buy",
    icon: Home,
    activeClass: "bg-primary text-white shadow-md shadow-primary/30",
    description: "Homes & Apartments",
  },
  {
    key: "rent",
    label: "Rent",
    icon: Key,
    activeClass: "bg-emerald-600 text-white shadow-md shadow-emerald-600/30",
    description: "Rental Properties",
  },
  {
    key: "plots",
    label: "Plots",
    icon: LandPlot,
    activeClass: "bg-amber-600 text-white shadow-md shadow-amber-600/30",
    description: "Land & Sites",
  },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const PLACEHOLDERS: Record<TabKey, string> = {
  buy: "Search apartment, villa, locality...",
  rent: "Search locality, BHK, area...",
  plots: "Search plot, site, locality...",
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
  const [activeTab, setActiveTab] = useState<TabKey>("buy");
  const [locality, setLocality] = useState<string>("any");
  const [q, setQ] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();

    if (activeTab === "plots") {
      // Plots tab → filter by type=plot, purpose=buy
      params.set("purpose", "buy");
      params.set("type", "plot");
    } else {
      // Buy or Rent → filter by purpose
      params.set("purpose", activeTab);
    }

    if (locality !== "any") params.set("locality", locality);
    if (q.trim()) params.set("q", q.trim());
    router.push(`/listings?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-2 shadow-modal">
      {/* Category tabs — Buy | Rent | Plots */}
      <div className="rounded-xl bg-surface p-1">
        <div className="flex gap-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2.5 transition-all duration-200 ${
                  isActive
                    ? t.activeClass
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                <span className="text-sm font-semibold">{t.label}</span>
                <span
                  className={`text-[10px] leading-none ${
                    isActive ? "text-white/70" : "text-muted-foreground/60"
                  }`}
                >
                  {t.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search fields */}
      <div className="mt-1 flex flex-col gap-2 p-1 sm:flex-row">
        {/* Text input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            placeholder={PLACEHOLDERS[activeTab]}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-11 w-full rounded-xl bg-input pl-10 pr-4 text-sm outline-none ring-0 transition placeholder:text-muted-foreground/60 focus:bg-input/80"
          />
        </div>

        {/* Locality select */}
        <div className="relative w-full sm:w-44">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground/60" />
          <Select value={locality} onValueChange={setLocality}>
            <SelectTrigger className="h-11 rounded-xl border-0 bg-input pl-8 text-sm focus:ring-0">
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

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-button transition-all hover:brightness-110"
        >
          Search
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
