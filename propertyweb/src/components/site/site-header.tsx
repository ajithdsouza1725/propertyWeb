"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { apiFetch } from "@/lib/api";
import { getAccessToken, logout } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Menu,
  Home,
  Key,
  TrendingUp,
  MapPin,
  LogOut,
  User,
  LayoutDashboard,
  X,
  Building2,
  Plus,
  Sparkles,
} from "lucide-react";

const navItems = [
  { href: "/listings?purpose=buy",  label: "Buy",         icon: Home },
  { href: "/listings?purpose=rent", label: "Rent",        icon: Key },
  { href: "/list-your-property",    label: "Sell / List", icon: TrendingUp },
  { href: "/localities",            label: "Localities",  icon: MapPin },
] as const;

function Logo({ name }: { name: string }) {
  const parts = name.trim().split(/(?=[A-Z])/);
  const first = parts[0] ?? name;
  const rest = parts.slice(1).join("");

  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2.5">
      {/* Icon mark — solid brand, quiet hover lift */}
      <div className="relative">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft transition-transform group-hover:-translate-y-px">
          <svg viewBox="0 0 20 20" className="size-5" fill="currentColor">
            <path d="M10 2.5L2 9h2v8.5h4.5V13h3v4.5H16V9h2L10 2.5z" />
          </svg>
        </div>
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-brand-2 ring-2 ring-background"
        />
      </div>

      {/* Wordmark — solid two-tone (primary + foreground), readable in any theme */}
      <div className="flex items-baseline leading-none">
        <span className="text-[16px] font-black tracking-tight text-primary">{first}</span>
        {rest && <span className="text-[16px] font-black tracking-tight text-foreground">{rest}</span>}
      </div>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [siteName, setSiteName] = useState("MangaloreHomes");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) { setRole(null); return; }
    apiFetch<{ role: string }>("/api/auth/me", { token })
      .then((me) => setRole(me.role))
      .catch(() => setRole(null));
  }, []);

  useEffect(() => {
    apiFetch<Record<string, unknown>>("/api/public/cms/settings")
      .then((s) => {
        if (typeof s.siteName === "string" && s.siteName.trim()) setSiteName(s.siteName.trim());
      })
      .catch(() => {});
  }, []);

  const dashboardHref  = role === "admin" ? "/admin" : role === "buyer" ? "/account" : role ? "/seller" : "/login";
  const dashboardLabel = role === "admin" ? "Admin panel" : role === "buyer" ? "My account" : role ? "Seller panel" : "";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b bg-background/95 shadow-soft backdrop-blur-xl"
          : "border-b border-transparent bg-background/85 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Logo name={siteName} />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {navItems.map((item) => {
            const base = item.href.split("?")[0];
            const active =
              pathname === base ||
              (base !== "/" && pathname.startsWith(base + "/")) ||
              (item.href.includes("?") &&
                pathname === base &&
                typeof window !== "undefined" &&
                window.location.search.includes(item.href.split("?")[1] ?? ""));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <item.icon className={cn("size-3.5 transition-opacity", active ? "text-primary" : "text-muted-foreground opacity-60 group-hover:opacity-100")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop right */}
        <div className="hidden items-center gap-2 md:flex">
          {role ? (
            <>
              <Link
                href={dashboardHref}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              >
                <LayoutDashboard className="size-3.5" />
                {dashboardLabel}
              </Link>
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              >
                <LogOut className="size-3.5" />
                Sign out
              </button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-xl border border-border/60 px-3 py-2 text-sm font-semibold text-muted-foreground shadow-soft transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary">
                  <User className="size-3.5" />
                  Sign in
                  <ChevronDown className="size-3 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-border/60">
                <DropdownMenuItem asChild className="rounded-xl">
                  <Link href="/login" className="flex items-center gap-3 px-3 py-2.5 text-sm">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-primary shadow-sm">
                      <User className="size-3.5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">Buyer</div>
                      <div className="text-xs text-muted-foreground">Browse &amp; enquire</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl">
                  <Link href="/seller/login" className="flex items-center gap-3 px-3 py-2.5 text-sm">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-brand-2 shadow-sm">
                      <Building2 className="size-3.5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">Seller / Agent</div>
                      <div className="text-xs text-muted-foreground">Post &amp; manage listings</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl">
                  <Link href="/admin/login" className="flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground">
                    <LayoutDashboard className="size-3.5" />
                    Admin access
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* CTA */}
          <Link
            href="/seller/properties/new"
            className="group inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="size-3.5" />
            Post Property
            <Sparkles className="size-3 opacity-70 group-hover:opacity-100" />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary">
                {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex h-full flex-col">
                {/* Mobile header */}
                <div className="flex items-center gap-2.5 border-b bg-primary/5 px-5 py-4">
                  <div className="relative flex size-10 items-center justify-center rounded-[11px] bg-primary shadow-md">
                    <svg viewBox="0 0 20 20" className="size-5 text-white" fill="currentColor">
                      <path d="M10 2.5L2 9h2v8.5h4.5V13h3v4.5H16V9h2L10 2.5z" />
                    </svg>
                    <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-brand-2 ring-1 ring-white" />
                  </div>
                  <span className="font-black text-foreground">{siteName}</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Browse</p>
                  <div className="space-y-0.5">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-primary/5 hover:text-primary"
                      >
                        <item.icon className="size-4 text-muted-foreground" />
                        {item.label}
                      </Link>
                    ))}
                    <Link href="/about" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
                      About
                    </Link>
                    <Link href="/contact" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
                      Contact
                    </Link>
                  </div>

                  <div className="mt-5 space-y-2 border-t pt-5">
                    <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Account</p>
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
                          onClick={() => { logout(); setMobileOpen(false); }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
                        >
                          <LogOut className="size-4" />
                          Sign out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary">
                          <User className="size-4 text-primary" /> Buyer sign in
                        </Link>
                        <Link href="/seller/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold transition-colors hover:border-brand-2/40 hover:bg-brand-2/5">
                          <Building2 className="size-4 text-brand-2" /> Seller login
                        </Link>
                      </>
                    )}
                    <Link
                      href="/seller/properties/new"
                      onClick={() => setMobileOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lift transition-colors hover:bg-primary/90"
                    >
                      <Plus className="size-4" /> Post Property Free
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
