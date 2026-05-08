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
  Home,
  MapPin,
  Phone,
  Heart,
} from "lucide-react";

/* ── Nav items ──────────────────────────────────────── */
const navItems = [
  { href: "/listings", label: "Properties", icon: Home },
  { href: "/localities", label: "Localities", icon: MapPin },
  { href: "/about", label: "About", icon: Building2 },
  { href: "/contact", label: "Contact", icon: Phone },
] as const;

/* ── Sign-in role cards ──────────────────────────────── */
const signInCards = [
  {
    href: "/login",
    icon: User,
    iconBg: "bg-primary/10 text-primary",
    label: "Buyer",
    description: "Browse & enquire",
  },
  {
    href: "/seller/login",
    icon: Building2,
    iconBg: "bg-accent/10 text-accent",
    label: "Seller / Agent",
    description: "Post & manage listings",
  },
  {
    href: "/admin/login",
    icon: LayoutDashboard,
    iconBg: "bg-muted text-muted-foreground",
    label: "Admin",
    description: "Platform management",
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

/* ── Main header component ──────────────────────────── */
export function SiteHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? null;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashboardHref =
    role === "admin" ? "/admin"
      : role === "buyer" ? "/account"
        : role ? "/seller" : "/login";
  const dashboardLabel =
    role === "admin" ? "Admin panel"
      : role === "buyer" ? "My account"
        : role ? "Seller panel" : "";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-white shadow-card"
          : "border-b border-transparent bg-white/80 backdrop-blur-xl"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">

          {/* ── Left: Logo ── */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary shadow-sm transition-transform group-hover:scale-105">
              <HouseIcon className="size-5 text-white" />
            </div>
            <div className="hidden items-baseline gap-0.5 sm:flex">
              <span className="text-lg font-extrabold tracking-tight text-foreground">
                Mangalore
              </span>
              <span className="text-lg font-extrabold tracking-tight text-primary">
                Homes
              </span>
            </div>
          </Link>

          {/* ── Center: Desktop Nav ── */}
          <nav className="hidden items-center gap-1 lg:flex">
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
                    "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Right: Actions ── */}
          <div className="flex items-center gap-2">
            {/* Desktop actions (lg+) */}
            <div className="hidden items-center gap-2 lg:flex">
              {role ? (
                <>
                  <Link
                    href={dashboardHref}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  >
                    <LayoutDashboard className="size-4" />
                    {dashboardLabel}
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 rounded-lg border border-border/60 px-3.5 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary">
                      <User className="size-4" />
                      Sign In
                      <ChevronDown className="size-3 opacity-50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-72 rounded-2xl border border-border/60 p-3 shadow-modal"
                  >
                    <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                      Sign in as
                    </p>
                    <div className="space-y-1">
                      {signInCards.map((card) => (
                        <Link
                          key={card.href}
                          href={card.href}
                          className="group flex items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-muted/60"
                        >
                          <div
                            className={cn(
                              "flex size-10 shrink-0 items-center justify-center rounded-xl",
                              card.iconBg
                            )}
                          >
                            <card.icon className="size-4.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold">{card.label}</div>
                            <div className="text-xs text-muted-foreground">{card.description}</div>
                          </div>
                          <ArrowRight className="size-3.5 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                        </Link>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* CTA — Post Property */}
              <Link
                href="/seller/properties/new"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-button transition-all hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 press-effect"
              >
                <Sparkles className="size-4" />
                Post Property
              </Link>
            </div>

            {/* Mobile hamburger */}
            <div className="lg:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button className="flex size-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted">
                    <Menu className="size-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0">
                  <div className="flex h-full flex-col">
                    {/* Mobile header */}
                    <div className="flex items-center gap-2.5 border-b px-5 py-4">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary shadow-sm">
                        <HouseIcon className="size-5 text-white" />
                      </div>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-lg font-extrabold text-foreground">Mangalore</span>
                        <span className="text-lg font-extrabold text-primary">Homes</span>
                      </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto px-4 py-5">
                      {/* Browse section */}
                      <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                        Browse
                      </p>
                      <div className="space-y-0.5">
                        {navItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                                pathname === item.href
                                  ? "bg-primary-soft text-primary"
                                  : "text-foreground hover:bg-muted/50"
                              )}
                            >
                              <Icon className="size-4 text-muted-foreground" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>

                      {/* Account section */}
                      <div className="mt-6 space-y-2 border-t pt-5">
                        <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                          Account
                        </p>
                        {role ? (
                          <>
                            <Link
                              href={dashboardHref}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm font-semibold text-primary"
                            >
                              <LayoutDashboard className="size-4" />
                              {dashboardLabel}
                            </Link>
                            <button
                              onClick={() => { logout(); setMobileOpen(false); }}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                            >
                              <LogOut className="size-4" />
                              Sign out
                            </button>
                          </>
                        ) : (
                          <div className="space-y-1.5">
                            {signInCards.map((card) => (
                              <Link
                                key={card.href}
                                href={card.href}
                                onClick={() => setMobileOpen(false)}
                                className="group flex items-center gap-3 rounded-xl border border-border/60 p-3 transition-all hover:border-primary/20 hover:bg-primary/5"
                              >
                                <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", card.iconBg)}>
                                  <card.icon className="size-4.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold">{card.label}</div>
                                  <div className="text-xs text-muted-foreground">{card.description}</div>
                                </div>
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
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-button press-effect"
                        >
                          <Sparkles className="size-4" />
                          Post Property Free
                        </Link>
                      </div>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
