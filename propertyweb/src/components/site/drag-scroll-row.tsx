"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

export function DragScrollRow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const state = useRef<{ isDown: boolean; startX: number; startScrollLeft: number }>({
    isDown: false,
    startX: 0,
    startScrollLeft: 0,
  });

  return (
    <div
      ref={ref}
      className={cn(
        "relative -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [-ms-overflow-style:none]",
        "cursor-grab select-none scroll-smooth",
        className
      )}
      style={{ WebkitOverflowScrolling: "touch" }}
      onPointerDown={(e) => {
        const el = ref.current;
        if (!el) return;
        state.current.isDown = true;
        state.current.startX = e.clientX;
        state.current.startScrollLeft = el.scrollLeft;
        el.setPointerCapture(e.pointerId);
        el.classList.add("cursor-grabbing");
      }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        if (!state.current.isDown) return;
        const dx = e.clientX - state.current.startX;
        el.scrollLeft = state.current.startScrollLeft - dx;
      }}
      onPointerUp={(e) => {
        const el = ref.current;
        if (!el) return;
        state.current.isDown = false;
        el.releasePointerCapture(e.pointerId);
        el.classList.remove("cursor-grabbing");
      }}
      onPointerCancel={(e) => {
        const el = ref.current;
        if (!el) return;
        state.current.isDown = false;
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
        el.classList.remove("cursor-grabbing");
      }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {children}
    </div>
  );
}

