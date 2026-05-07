"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { logout } from "@/lib/auth";
import { useAuth } from "@/lib/use-access-token";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  LogOut,
  User,
  LayoutDashboard,
  Building2,
  Sparkles,
} from "lucide-react";

/* ── Nav items ──────────────────────────────────────── */
const navItems = [
  { href: "/listings", label: "Properties" },
  { href: "/localities", label: "Localities" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

/* ── Sign-in role cards config ──────────────────────── */
const signInCards = [
  {
    href: "/login",
    icon: User,
    iconBg: "bg-primary-soft",
    label: "Buyer",
    description: "I'm looking to buy/rent",
  },
  {
    href: "/seller/login",
    icon: Building2,
    iconBg: "bg-accent-soft",
    label: "Seller / Agent",
    description: "I want to list a property",
  },
  {
    href: "/admin/login",
    icon: LayoutDashboard,
    iconBg: "bg-muted",
    label: "Admin",
    description: "Admin access",
  },
] as const;

/* ── House icon SVG ─────────────────────────────────── */
function HouseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor">
      <path d="M10 2.5L2 9h2v8.5h4.5V13h3v4.5H16V9h2L10 2.5z" />
    </svg>
  );
}

/* ── Logo ───────────────────────────────────────────── */
function Logo() {
  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2">
      <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
        <HouseIcon className="size-[18px] text-white" />
      </div>
      <div className="flex items-baseline leading-none">
        <span className="text-base font-bold text-foreground">Mangalore</span>
        <span className="text-base font-bold text-primary">Homes</span>
      </div>
    </Link>
  );
}

/* ── Main header component ──────────────────────────── */
export function SiteHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? null;
  const [siteName, setSiteName] = useState("MangaloreHomes");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Site name fetch ── */
  useEffect(() => {
    fetch("/api/backend/api/public/cms/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (s && typeof s.siteName === "string" && s.siteName.trim())
          setSiteName(s.siteName.trim());
      })
      .catch(() => {});
  }, []);

  /* ── Role-based redirect ── */
  const dashboardHref =
    role === "admin"
      ? "/admin"
      : role === "buyer"
        ? "/account"
        : role
          ? "/seller"
          : "/login";
  const dashboardLabel =
    role === "admin"
      ? "Admin panel"
      : role === "buyer"
        ? "My account"
        : role
          ? "Seller panel"
          : "";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-white transition-shadow duration-300",
        scrolled ? "border-border shadow-card" : "border-transparent"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        {/* ── Logo ── */}
        <Logo />

        {/* ── Desktop Nav (lg+) ── */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => {
            const href = item.href as string;
            const active =
              pathname === href ||
              (href !== "/" && pathname.startsWith(href + "/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-sm font-medium transition-colors duration-200",
                  active
                    ? "text-primary"
                    : "text-foreground/80 hover:text-primary"
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Desktop Right Actions ── */}
        <div className="hidden items-center gap-3 lg:flex">
          {role ? (
            /* Logged-in: dashboard link + logout */
            <>
              <Link
                href={dashboardHref}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  "text-foreground/80 hover:text-primary"
                )}
              >
                <LayoutDashboard className="size-4" />
                {dashboardLabel}
              </Link>
              <button
                onClick={() => logout()}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  "text-foreground/80 hover:text-primary"
                )}
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </>
          ) : (
            /* Sign-in dropdown */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                >
                  <User className="size-4" />
                  Sign In
                  <ChevronDown className="size-3 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-72 rounded-2xl border-0 p-4 shadow-modal"
              >
                <div className="space-y-2">
                  {signInCards.map((card) => (
                    <Link
                      key={card.href}
                      href={card.href}
                      className="group flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted/60"
                    >
                      <div
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-xl",
                          card.iconBg
                        )}
                      >
                        <card.icon className="size-5 text-foreground/70" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground">
                          {card.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {card.description}
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* CTA — Post Property */}
          <Link
            href="/seller/properties/new"
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-button transition-transform hover:-translate-y-0.5 active:translate-y-0",
              ""
            )}
          >
            <Sparkles className="size-4" />
            Post Property
          </Link>
        </div>

        {/* ── Mobile hamburger (below lg) ── */}
        <div className="lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl transition-colors",
                  "text-foreground hover:bg-muted"
                )}
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex h-full flex-col">
                {/* Mobile header */}
                <div className="flex items-center gap-2 border-b px-5 py-4">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
                    <HouseIcon className="size-[18px] text-white" />
                  </div>
                  <div className="flex items-baseline leading-none">
                    <span className="text-base font-bold text-foreground">
                      Mangalore
                    </span>
                    <span className="text-base font-bold text-primary">
                      Homes
                    </span>
                  </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-5">
                  {/* Browse section */}
                  <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    Browse
                  </p>
                  <div className="space-y-0.5">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-primary/5 hover:text-primary",
                          pathname === item.href
                            ? "text-primary bg-primary/5"
                            : "text-foreground"
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  {/* Account section */}
                  <div className="mt-6 space-y-2 border-t pt-5">
                    <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                      Account
                    </p>
                    {role ? (
                      <>
                        <Link
                          href={dashboardHref}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm font-semibold text-primary"
                        >
                          <LayoutDashboard className="size-4" />
                          {dashboardLabel}
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setMobileOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                        >
                          <LogOut className="size-4" />
                          Sign out
                        </button>
                      </>
                    ) : (
                      <div className="space-y-2">
                        {signInCards.map((card) => (
                          <Link
                            key={card.href}
                            href={card.href}
                            onClick={() => setMobileOpen(false)}
                            className="group flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
                          >
                            <div
                              className={cn(
                                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                                card.iconBg
                              )}
                            >
                              <card.icon className="size-5 text-foreground/70" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-foreground">
                                {card.label}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {card.description}
                              </div>
                            </div>
                            <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Post Property CTA */}
                  <div className="mt-6 border-t pt-5">
                    <Link
                      href="/seller/properties/new"
                      onClick={() => setMobileOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-button transition-colors hover:bg-primary/90"
                    >
                      <Sparkles className="size-4" />
                      Post Property
                    </Link>
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
