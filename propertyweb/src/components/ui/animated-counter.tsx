"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts up from 0 to `value` when visible in viewport.
 * Works with numbers like "500+", "7,000+", "32".
 */
export function AnimatedCounter({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setHasAnimated(true);

        // Extract numeric part
        const numMatch = value.replace(/,/g, "").match(/(\d+)/);
        if (!numMatch) {
          setDisplayed(value);
          return;
        }

        const target = parseInt(numMatch[1], 10);
        const suffix = value.replace(/[\d,]/g, ""); // e.g. "+"
        const hasComma = value.includes(",");
        const duration = 1500;
        const steps = 40;
        const stepTime = duration / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
          step++;
          // Ease-out curve
          const progress = 1 - Math.pow(1 - step / steps, 3);
          current = Math.round(target * progress);
          const formatted = hasComma
            ? current.toLocaleString("en-IN")
            : String(current);
          setDisplayed(formatted + suffix);

          if (step >= steps) {
            clearInterval(timer);
            setDisplayed(value); // exact final value
          }
        }, stepTime);
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <span ref={ref} className={className}>
      {displayed}
    </span>
  );
}
