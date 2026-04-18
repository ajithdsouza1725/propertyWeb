"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, getApiErrorMessage } from "@/lib/api";
import { setAccessToken } from "@/lib/auth";
import {
  Building2,
  Eye,
  EyeOff,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Home,
  LayoutDashboard,
} from "lucide-react";

export type LoginGate = "buyer" | "seller" | "admin" | "any";

const ALLOWED_ROLES: Record<Exclude<LoginGate, "any">, string[]> = {
  buyer: ["buyer"],
  seller: ["owner", "agent"],
  admin: ["admin"],
};

const REDIRECT: Record<Exclude<LoginGate, "any">, string> = {
  buyer: "/account",
  seller: "/seller",
  admin: "/admin",
};

export function redirectPathForRole(role: string): string {
  const r = role.toLowerCase();
  if (r === "admin") return "/admin";
  if (r === "owner" || r === "agent") return "/seller";
  return "/account";
}

const WRONG_ROLE_MESSAGE: Record<Exclude<LoginGate, "any">, string> = {
  buyer: "This account is not a buyer. Owners/agents should use seller sign in.",
  seller: "This login is for owners and agents only. Buyers should use the main sign in.",
  admin: "This login is restricted to administrators.",
};

// Icon mark per role uses a single solid brand token — no gradients, no ad-hoc oklch.
const GATE_CONFIG: Record<LoginGate, { icon: React.ElementType; badgeClass: string; sublabel: string }> = {
  any:    { icon: Building2,   badgeClass: "bg-primary text-primary-foreground",      sublabel: "Sign in to continue" },
  buyer:  { icon: Home,        badgeClass: "bg-primary text-primary-foreground",      sublabel: "Browse saved properties & track enquiries" },
  seller: { icon: Building2,   badgeClass: "bg-brand-2 text-white",                    sublabel: "Manage listings & buyer leads" },
  admin:  { icon: ShieldCheck, badgeClass: "bg-brand-deep text-white ring-1 ring-white/10", sublabel: "Platform management & approvals" },
};

export function RoleLoginForm({
  gate,
  title,
  description: _desc,
  links,
  showForgotPassword = true,
}: {
  gate: LoginGate;
  title: string;
  description: string;
  links: { href: string; label: string }[];
  showForgotPassword?: boolean;
}) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = GATE_CONFIG[gate];
  const GateIcon = config.icon;

  async function handleSubmit() {
    if (!identifier.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Trim both — browser autofill/autocomplete occasionally injects trailing
      // whitespace which is invisible to the user but breaks the bcrypt compare.
      const res = await apiFetch<{ accessToken: string }>("/api/auth/login", {
        body: { identifier: identifier.trim(), password: password.trim() },
      });
      const me = await apiFetch<{ role: string }>("/api/auth/me", { token: res.accessToken });
      const roleNorm = (me.role ?? "").toLowerCase();
      if (gate !== "any") {
        const allowed = ALLOWED_ROLES[gate];
        if (!allowed.includes(roleNorm)) {
          setError(WRONG_ROLE_MESSAGE[gate]);
          return;
        }
      }
      setAccessToken(res.accessToken);
      const dest = gate === "any" ? redirectPathForRole(roleNorm) : REDIRECT[gate];
      router.refresh();
      router.push(dest);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Login failed. Check your credentials."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className={`flex size-14 items-center justify-center rounded-2xl shadow-lift ${config.badgeClass}`}>
            <GateIcon className="size-7" />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{config.sublabel}</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border bg-card px-7 py-6 shadow-sm">
          {error && (
            <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Identifier */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                Email or phone
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
                <input
                  type="text"
                  placeholder="you@email.com or 9876543210"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  autoComplete="username"
                  className="h-11 w-full rounded-xl border bg-muted/30 pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/40 focus:border-primary/40 focus:bg-background focus:ring-2 focus:ring-primary/15"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Password</label>
                {(gate === "buyer" || gate === "any") && showForgotPassword && (
                  <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  autoComplete="current-password"
                  className="h-11 w-full rounded-xl border bg-muted/30 pl-10 pr-11 text-sm outline-none transition placeholder:text-muted-foreground/40 focus:border-primary/40 focus:bg-background focus:ring-2 focus:ring-primary/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
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

          {/* Signup link */}
          {(gate === "any" || gate === "buyer") && (
            <p className="mt-5 border-t pt-5 text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Create a free account
              </Link>
            </p>
          )}
          {gate === "seller" && (
            <p className="mt-5 border-t pt-5 text-center text-sm text-muted-foreground">
              No seller account?{" "}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Register as seller
              </Link>
            </p>
          )}
        </div>

        {/* Other portals */}
        {links.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="flex items-center gap-1 hover:text-foreground transition-colors">
                {l.href.includes("/admin") && <LayoutDashboard className="size-3" />}
                {l.href.includes("/seller") && <Building2 className="size-3" />}
                {l.href === "/login" && <Home className="size-3" />}
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
