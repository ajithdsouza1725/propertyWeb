"use client";

import { useEffect } from "react";

/**
 * Activates scroll-triggered animations site-wide.
 * Drop this component once in the root layout. It observes all elements
 * with .scroll-animate or .scroll-animate-scale and adds .is-visible
 * when they enter the viewport.
 *
 * Usage in any page/component:
 *   <div className="scroll-animate" data-delay="2">Content</div>
 */
export function ScrollAnimateObserver() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // animate once only
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    const els = document.querySelectorAll(".scroll-animate, .scroll-animate-scale");
    els.forEach((el) => observer.observe(el));

    // Re-observe on route changes (Next.js SPA navigation)
    const mutObs = new MutationObserver(() => {
      document.querySelectorAll(".scroll-animate:not(.is-visible), .scroll-animate-scale:not(.is-visible)")
        .forEach((el) => observer.observe(el));
    });
    mutObs.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutObs.disconnect();
    };
  }, []);

  return null;
}
