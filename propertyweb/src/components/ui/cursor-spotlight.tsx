"use client";

import { useEffect } from "react";

/**
 * Attach to any page — finds .cursor-spotlight elements and updates
 * CSS custom properties to follow the mouse. The visual effect is
 * defined in globals.css.
 */
export function CursorSpotlightTracker() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const els = document.querySelectorAll<HTMLElement>(".cursor-spotlight");
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        el.style.setProperty("--spotlight-x", `${x}px`);
        el.style.setProperty("--spotlight-y", `${y}px`);
      });
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return null;
}
