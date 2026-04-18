"use client";

import { useEffect } from "react";
import { trackView } from "@/lib/recently-viewed";

/**
 * Drop this into a property detail page to record the visit in localStorage.
 * Renders nothing — it's a side-effect-only component.
 */
export function TrackPropertyView({ slug, title }: { slug: string; title: string }) {
  useEffect(() => {
    trackView(slug, title);
  }, [slug, title]);
  return null;
}
