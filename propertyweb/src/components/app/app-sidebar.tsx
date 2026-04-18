"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export type SidebarItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  group?: string;
  /** If true, this item shows a count badge. Pass the count as `badge`. */
  badge?: number;
};

export function AppSidebar({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: SidebarItem[];
}) {
  const pathname = usePathname();

  const backItem = items.find((i) => i.href === "/");
  const mainItems = items.filter((i) => i.href !== "/");

  // Group items by `group` field
  const groups: { label: string; items: SidebarItem[] }[] = [];
  const seen = new Set<string>();
  for (const item of mainItems) {
    const g = item.group ?? "";
    if (!seen.has(g)) {
      seen.add(g);
      groups.push({ label: g, items: mainItems.filter((i) => (i.group ?? "") === g) });
    }
  }

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col bg-slate-950 text-white lg:flex" style={{ minHeight: "100dvh" }}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
          <svg viewBox="0 0 20 20" className="size-4 text-white" fill="currentColor">
            <path d="M10 2.5L2 9h2v8.5h4.5V13h3v4.5H16V9h2L10 2.5z" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-black tracking-tight text-white">{title}</div>
          {subtitle && (
            <div className="truncate text-[11px] text-white/50 leading-tight mt-0.5">{subtitle}</div>
          )}
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((group, gi) => (
          <div key={group.label || gi} className={gi > 0 ? "mt-6" : ""}>
            {group.label && (
              <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href.length > 1 && pathname?.startsWith(item.href + "/"));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-all",
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/55 hover:bg-white/5 hover:text-white/90"
                    )}
                  >
                    <span className={cn(
                      "flex size-5 shrink-0 items-center justify-center transition-colors",
                      active ? "text-white" : "text-white/40 group-hover:text-white/70"
                    )}>
                      {item.icon}
                    </span>
                    <span className="truncate flex-1">{item.label}</span>
                    {item.badge != null && item.badge > 0 && (
                      <span className="ml-auto shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white tabular-nums">
                        {item.badge}
                      </span>
                    )}
                    {active && (
                      <span className="ml-auto size-1.5 rounded-full bg-white shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Back to site */}
      {backItem && (
        <div className="border-t border-white/10 px-3 py-3">
          <Link
            href={backItem.href}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-white/40 transition-all hover:bg-white/5 hover:text-white/80"
          >
            <ExternalLink className="size-4" />
            {backItem.label}
          </Link>
        </div>
      )}
    </aside>
  );
}
