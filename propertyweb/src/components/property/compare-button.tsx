"use client";

import { useEffect, useState } from "react";
import { addToCompare, isInCompare, removeFromCompare } from "@/lib/compare";
import { Scale } from "lucide-react";

/**
 * Small "Compare" toggle button for property cards.
 * Adds/removes the property from the localStorage compare list (max 3).
 */
export function CompareButton({ propertyId }: { propertyId: number }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isInCompare(propertyId));
    const handler = () => setActive(isInCompare(propertyId));
    window.addEventListener("pw-compare-changed", handler);
    return () => window.removeEventListener("pw-compare-changed", handler);
  }, [propertyId]);

  return (
    <button
      type="button"
      aria-label={active ? "Remove from compare" : "Add to compare"}
      title={active ? "Remove from compare" : "Compare (max 3)"}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-primary-soft hover:text-primary"
      }`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (active) {
          removeFromCompare(propertyId);
        } else {
          addToCompare(propertyId);
        }
      }}
    >
      <Scale className="size-3" />
      {active ? "Added" : "Compare"}
    </button>
  );
}
