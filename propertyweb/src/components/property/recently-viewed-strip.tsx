"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getRecentlyViewed, type RecentlyViewedItem } from "@/lib/recently-viewed";
import { Clock, ArrowRight } from "lucide-react";

/**
 * Horizontal strip showing recently-viewed properties. Client-only (reads
 * localStorage). Render on homepage, listings sidebar, or account page.
 */
export function RecentlyViewedStrip() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewed());
  }, []);

  if (items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Clock className="size-4" />
        Recently viewed
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {items.slice(0, 6).map((item) => (
          <Link
            key={item.slug}
            href={`/property/${item.slug}`}
            className="flex-none rounded-xl border bg-card px-4 py-2.5 text-sm font-medium shadow-card transition-colors hover:border-primary/30 hover:text-primary"
          >
            <span className="line-clamp-1 max-w-[200px]">{item.title}</span>
          </Link>
        ))}
        <Link
          href="/listings"
          className="flex flex-none items-center gap-1 rounded-xl border border-dashed px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          Browse more <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
