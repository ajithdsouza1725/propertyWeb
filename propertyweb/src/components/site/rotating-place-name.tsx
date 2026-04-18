"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type PlaceName = {
  label: string;
  title?: string;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export function RotatingPlaceName({
  className,
  intervalMs = 2200,
}: {
  className?: string;
  intervalMs?: number;
}) {
  const reducedMotion = usePrefersReducedMotion();

  const items: PlaceName[] = useMemo(
    () => [
      { label: "Mangalore" },
      { label: "ಮಂಗಳೂರು", title: "Kannada" },
      { label: "मैंगलोर", title: "Hindi" },
      { label: "Kodial", title: "Konkani" },
      { label: "Kudla", title: "Tulu" },
    ],
    []
  );

  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reducedMotion) return;

    const id = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIdx((i) => (i + 1) % items.length);
        setVisible(true);
      }, 180);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [intervalMs, items.length, reducedMotion]);

  const current = items[idx]!;

  return (
    <span
      className={cn(
        "inline-block min-w-[9ch] text-center align-baseline transition-all duration-200",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
        className
      )}
      title={current.title}
      aria-hidden="true"
    >
      {reducedMotion ? items[0]!.label : current.label}
    </span>
  );
}

