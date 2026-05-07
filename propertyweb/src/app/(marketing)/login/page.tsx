"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import { notifyAuthChanged } from "@/lib/auth";
import { redirectPathForRole } from "@/components/auth/role-login-form";
import {
  Home,
  Search,
  Heart,
  Bell,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  CheckCircle2,
} from "lucide-react";

const BUYER_PERKS = [
  { icon: Search,  title: "Browse verified listings",  desc: "Hundreds of apartments, villas, plots in Mangalore." },
  { icon: Heart,   title: "Save favourites",            desc: "Bookmark properties and come back anytime." },
  { icon: Bell,    title: "Track your enquiries",       desc: "See every enquiry you've submitted in one place." },
  { icon: Home,    title: "No registration to enquire", desc: "Enquire on any property — account optional." },
];

export default function MainLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!identifier.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Call Next.js auth proxy — sets httpOnly cookie.
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Login failed. Check your email/phone and password.");
        return;
      }
      notifyAuthChanged();
      router.refresh();
      router.push(redirectPathForRole(data.role ?? ""));
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Login failed. Check your email/phone and password."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh bg-background">
      {/* ── LEFT PANEL ─ Buyer benefits ─────────────────────── */}
      <aside className="relative hidden w-[45%] shrink-0 flex-col justify-between overflow-hidden bg-brand-deep p-12 lg:flex">
        {/* Decorative ambient glow — single soft tone, no rainbow */}
        <div aria-hidden className="pointer-events-none absolute -left-16 -top-16 size-96 rounded-full bg-primary/15 blur-[90px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-10 left-16 size-64 rounded-full bg-accent/10 blur-[70px]" />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <Building2 className="size-5 text-white" />
          </div>
          <span className="text-base font-bold text-white">MangaloreHomes</span>
        </div>

        {/* Hero */}
        <div className="relative space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight text-white">
              Find your perfect home<br />in Mangalore
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              Sign in to save favourites, track enquiries and stay updated on new listings.
            </p>
          </div>

          {/* Perks */}
          <div className="space-y-4">
            {BUYER_PERKS.map((p) => {
              const Ic = p.icon;
              return (
                <div key={p.title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                    <Ic className="size-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{p.title}</div>
                    <div className="text-xs text-white/45">{p.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="flex gap-8 border-t border-white/10 pt-6">
            {[
              { value: "500+",   label: "Listings" },
              { value: "Free",   label: "To browse" },
              { value: "Direct", label: "Enquiries" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-xl font-extrabold text-white">{s.value}</div>
                <div className="text-xs text-white/40">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex items-center gap-2 text-xs text-white/30">
          <CheckCircle2 className="size-3.5 text-emerald-400/60" />
          Trusted by 1,200+ buyers in Mangalore
        </div>
      </aside>

      {/* ── RIGHT PANEL ─ Form ──────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lift">
              <Home className="size-7" />
            </div>
            <h2 className="mt-4 text-2xl font-black tracking-tight">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your MangaloreHomes account
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border bg-card px-7 py-6 shadow-sm">
            {error && (
              <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Identifier */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-foreground/60">
                  Email or phone
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
                  <input
                    type="text"
                    placeholder="you@email.com or 9876543210"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    autoComplete="username"
                    className="h-11 w-full rounded-xl border bg-muted/30 pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/40 focus:border-primary/40 focus:bg-background focus:ring-2 focus:ring-primary/15"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wide text-foreground/60">Password</label>
                  <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    autoComplete="current-password"
                    className="h-11 w-full rounded-xl border bg-muted/30 pl-10 pr-11 text-sm outline-none transition placeholder:text-muted-foreground/40 focus:border-primary/40 focus:bg-background focus:ring-2 focus:ring-primary/15"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleLogin}
                disabled={loading || !identifier.trim() || !password.trim()}
                className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:bg-primary/90 hover:-translate-y-px hover:shadow-lg active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in…
                  </>
                ) : (
                  <>Sign in <ArrowRight className="size-4" /></>
                )}
              </button>
            </div>

            <p className="mt-5 border-t pt-5 text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Create a free account
              </Link>
            </p>
          </div>

          {/* Unified sign-in: buyers, sellers and admins all use this page.
              The API decides where to send you based on your account role. */}
          <p className="mt-5 text-center text-xs text-muted-foreground">
            One sign-in for buyers, sellers and admins.
          </p>
        </div>
      </div>
    </div>
  );
}
