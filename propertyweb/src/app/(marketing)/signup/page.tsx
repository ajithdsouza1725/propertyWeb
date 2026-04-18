"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, getApiErrorMessage } from "@/lib/api";
import { setAccessToken } from "@/lib/auth";
import {
  Home,
  Building2,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

type Path = "buyer" | "seller";

const PATH_CONFIG: Record<
  Path,
  {
    role: string;
    icon: React.ElementType;
    title: string;
    desc: string;
    perks: string[];
    accent: "primary" | "gold";
  }
> = {
  buyer: {
    role: "buyer",
    icon: Home,
    title: "I'm looking to buy or rent",
    desc: "Browse listings, save favourites, track enquiries.",
    perks: ["Save favourite properties", "Track your enquiries", "New-listing notifications"],
    accent: "primary",
  },
  seller: {
    role: "owner",
    icon: Building2,
    title: "I want to list my property",
    desc: "Post listings, manage leads, grow your business.",
    perks: ["Post unlimited listings", "Verified buyer leads", "Manage enquiries in one place"],
    accent: "gold",
  },
};

function Field({
  icon: Icon,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  hint?: React.ReactNode;
}) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
        <input
          type={isPassword && showPw ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="h-11 w-full rounded-xl border bg-muted/40 pl-10 pr-10 text-sm transition-colors placeholder:text-muted-foreground/50 focus:border-primary/40 focus:bg-background focus:outline-none"
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-foreground"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {hint}
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [path, setPath] = useState<Path>("buyer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const cfg = PATH_CONFIG[path];

  const canSubmit =
    fullName.trim().length > 0 &&
    password.length >= 8 &&
    (email.trim().length > 0 || phone.trim().length > 0);

  async function handleSignup() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ accessToken: string }>("/api/auth/signup", {
        body: {
          fullName: fullName.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          password,
          role: cfg.role,
        },
      });
      setAccessToken(res.accessToken);
      setSuccess(true);
      const me = await apiFetch<{ role: string }>("/api/auth/me", { token: res.accessToken });
      router.refresh();
      if (me.role === "admin") router.push("/admin");
      else if (me.role === "owner" || me.role === "agent") router.push("/seller");
      else router.push("/account");
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Sign up failed. Try a different email or phone."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-start justify-center bg-background px-4 py-14">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">Create your account</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Choose how you&apos;d like to use MangaloreHomes
          </p>
        </div>

        {/* Path selector — two clean option cards, no ad-hoc gradients */}
        <div className="mb-6 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account type">
          {(Object.entries(PATH_CONFIG) as [Path, typeof PATH_CONFIG.buyer][]).map(([key, c]) => {
            const Ic = c.icon;
            const active = path === key;
            const accentClass = c.accent === "gold" ? "text-brand-2" : "text-primary";
            return (
              <button
                key={key}
                role="radio"
                aria-checked={active}
                onClick={() => setPath(key)}
                className={[
                  "flex flex-col items-start gap-3 rounded-2xl border bg-card p-4 text-left transition-all",
                  active
                    ? "border-primary shadow-lift ring-1 ring-primary"
                    : "border-border shadow-soft hover:border-primary/30",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex size-9 items-center justify-center rounded-xl transition-colors",
                    active ? "bg-primary text-primary-foreground" : `bg-muted ${accentClass}`,
                  ].join(" ")}
                >
                  <Ic className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold leading-snug">{c.title}</div>
                  <div className="mt-0.5 text-xs leading-snug text-muted-foreground">{c.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Perks — soft row, not heavy cards */}
        <ul className="mb-5 flex flex-wrap gap-x-4 gap-y-1.5">
          {cfg.perks.map((p) => (
            <li key={p} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
              {p}
            </li>
          ))}
        </ul>

        {/* Form */}
        <div className="rounded-2xl border bg-card p-6 shadow-soft md:p-7">
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}
          {success && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-emerald-600/30 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            >
              Account created — signing you in…
            </div>
          )}

          <div className="space-y-4">
            <Field
              icon={User}
              label="Full name"
              placeholder="Rajan Shetty"
              value={fullName}
              onChange={setFullName}
              autoComplete="name"
            />
            <Field
              icon={Mail}
              label="Email"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />
            <Field
              icon={Phone}
              label="Phone"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={setPhone}
              autoComplete="tel"
            />
            <Field
              icon={Lock}
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              hint={
                password.length > 0 && password.length < 8 ? (
                  <p className="mt-1.5 text-xs text-destructive">
                    Password must be at least 8 characters
                  </p>
                ) : null
              }
            />

            <button
              onClick={handleSignup}
              disabled={loading || !canSubmit}
              className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-lift transition-all hover:-translate-y-px hover:bg-primary/90 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>

          <p className="mt-6 border-t pt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="underline-offset-4 hover:text-foreground hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline-offset-4 hover:text-foreground hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
