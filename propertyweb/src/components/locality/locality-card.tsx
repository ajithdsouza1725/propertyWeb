import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, MapPin, Sparkles } from "lucide-react";

export type LocalityCardModel = {
  city: string;
  name: string;
  slug: string;
  blurb?: string | null;
  /** Catalog “featured” locality (popular area). */
  isFeatured?: boolean;
};

export function LocalityCard({ locality }: { locality: LocalityCardModel }) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-muted/60 bg-card shadow-sm ring-1 ring-transparent transition hover:-translate-y-0.5 hover:shadow-lg",
        locality.isFeatured
          ? "hover:ring-amber-400/30 dark:hover:ring-amber-600/25"
          : "hover:ring-primary/15"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-1",
          locality.isFeatured
            ? "bg-linear-to-r from-amber-500 via-orange-400 to-rose-500"
            : "bg-linear-to-r from-primary/60 via-primary/20 to-transparent"
        )}
      />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <MapPin className={cn("size-4", locality.isFeatured && "text-amber-600 dark:text-amber-400")} />
              <span>{locality.city}</span>
              {locality.isFeatured ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950 dark:bg-amber-950/60 dark:text-amber-100">
                  <Sparkles className="size-3" aria-hidden />
                  Popular
                </span>
              ) : null}
            </div>
            <div
              className={cn(
                "mt-1 text-lg font-semibold tracking-tight",
                locality.isFeatured && "text-amber-950 dark:text-amber-50"
              )}
            >
              {locality.name}
            </div>
          </div>
          <ArrowUpRight className="mt-1 size-5 text-muted-foreground transition group-hover:text-foreground" />
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {locality.blurb ?? `Explore listings in ${locality.name}.`}
        </p>
        <Link
          href={`/locality/${locality.slug}`}
          className="mt-4 inline-flex text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Explore listings
        </Link>
      </CardContent>
    </Card>
  );
}

