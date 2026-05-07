"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  const tabs = [
    {
      href: "/listings",
      label: "Browse",
      icon: Home,
      active: pathname.startsWith("/listings") || pathname.startsWith("/property"),
    },
    {
      href: "/account",
      label: "Saved",
      icon: Heart,
      active: pathname === "/account",
    },
    {
      href: "/list-your-property",
      label: "Post",
      icon: Plus,
      isCenter: true,
      active: false, // always teal
    },
    {
      href: "/account",
      label: "Account",
      icon: User,
      active: pathname === "/account",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block border-t border-border bg-white lg:hidden"
         style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          if (tab.isCenter) {
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className="flex flex-col items-center gap-0.5 -mt-4"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-primary text-white shadow-button">
                  <Icon className="size-5" />
                </div>
                <span className="text-[10px] font-semibold text-primary">{tab.label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className="flex flex-col items-center gap-0.5"
            >
              <Icon className={cn("size-5", tab.active ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-[10px]", tab.active ? "font-semibold text-primary" : "text-muted-foreground")}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
