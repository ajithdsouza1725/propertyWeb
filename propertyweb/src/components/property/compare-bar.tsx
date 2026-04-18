"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCompareIds, clearCompare } from "@/lib/compare";
import { Scale, X } from "lucide-react";

/**
 * Floating bar at the bottom of the screen when the user has items in compare.
 * Shows count + "Compare now" link + "Clear" button.
 * Renders nothing if compare list is empty.
 */
export function CompareBar() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getCompareIds().length);
    sync();
    window.addEventListener("pw-compare-changed", sync);
    return () => window.removeEventListener("pw-compare-changed", sync);
  }, []);

  if (count === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 animate-fade-up">
      <div className="flex items-center gap-3 rounded-2xl border bg-card px-5 py-3 shadow-lift">
        <Scale className="size-4 text-primary" />
        <span className="text-sm font-semibold">
          {count} {count === 1 ? "property" : "properties"} selected
        </span>
        <Link
          href="/compare"
          className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Compare now
        </Link>
        <button
          onClick={() => clearCompare()}
          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Clear compare list"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
