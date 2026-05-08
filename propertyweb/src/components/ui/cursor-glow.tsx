"use client";

import { useEffect, useRef } from "react";

/**
 * Adds a radial glow that follows the cursor inside its parent container.
 * Parent must have `position: relative` and `overflow: hidden`.
 */
export function CursorGlow({ color = "rgba(15,123,108,0.08)" }: { color?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    const move = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.transform = `translate(${x - 200}px, ${y - 200}px)`;
      el.style.opacity = "1";
    };
    const leave = () => {
      el.style.opacity = "0";
    };

    parent.addEventListener("mousemove", move);
    parent.addEventListener("mouseleave", leave);
    return () => {
      parent.removeEventListener("mousemove", move);
      parent.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute z-0 size-[400px] rounded-full opacity-0 transition-opacity duration-300"
      style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
    />
  );
}
