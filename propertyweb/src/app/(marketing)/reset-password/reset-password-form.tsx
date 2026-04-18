"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";

function StrengthBar({ password }: { password: string }) {
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasNum = /[0-9]/.test(password);
  const score = (len >= 8 ? 1 : 0) + (len >= 12 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNum ? 1 : 0);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-400", "bg-amber-400", "bg-emerald-400", "bg-emerald-500"];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${i <= score ? colors[score] : "bg-muted"}`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{labels[score]}</p>
    </div>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit = !!token && password.length >= 8 && password === confirm;

  async function handleReset() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await apiFetch<{ ok: boolean }>("/api/auth/reset-password", {
        body: { token, newPassword: password },
      });
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message ?? "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-[oklch(0.38_0.22_280)] shadow-lg shadow-primary/20">
            <ShieldCheck className="size-7 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Set new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a strong password for your account.
          </p>
        </div>

        <div className="rounded-2xl border bg-card px-7 py-6 shadow-sm">
          {/* No token */}
          {!token && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Reset link is missing or invalid. Please{" "}
              <Link href="/forgot-password" className="font-semibold underline underline-offset-2">
                request a new one
              </Link>
              .
            </div>
          )}

          {done ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="size-8 text-emerald-500" />
              </div>
              <div>
                <h2 className="font-bold">Password updated!</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Redirecting you to sign in…
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* New password */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-foreground/60">
                  New password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!token}
                    autoComplete="new-password"
                    className="h-11 w-full rounded-xl border bg-muted/30 pl-10 pr-11 text-sm outline-none transition placeholder:text-muted-foreground/40 focus:border-primary/40 focus:bg-background focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
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
                <StrengthBar password={password} />
              </div>

              {/* Confirm */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-foreground/60">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleReset()}
                    disabled={!token}
                    autoComplete="new-password"
                    className={`h-11 w-full rounded-xl border bg-muted/30 pl-10 pr-11 text-sm outline-none transition placeholder:text-muted-foreground/40 focus:bg-background focus:ring-2 disabled:opacity-50 ${mismatch ? "border-destructive/50 focus:border-destructive/50 focus:ring-destructive/15" : "focus:border-primary/40 focus:ring-primary/15"}`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {mismatch && (
                  <p className="mt-1 text-xs text-destructive">Passwords don&apos;t match</p>
                )}
              </div>

              <button
                onClick={handleReset}
                disabled={loading || !canSubmit}
                className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:bg-primary/90 hover:-translate-y-px hover:shadow-lg active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Updating…
                  </>
                ) : (
                  <>Update password <ArrowRight className="size-4" /></>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-center">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
