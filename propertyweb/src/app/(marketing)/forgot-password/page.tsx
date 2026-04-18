"use client";

import Link from "next/link";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Mail, Phone, ArrowRight, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!identifier.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await apiFetch<{ ok: boolean }>("/api/auth/forgot-password", {
        body: { identifier: identifier.trim() },
      });
      setDone(true);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message ?? "Request failed. Please try again.");
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
            <KeyRound className="size-7 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Forgot password?</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your registered email or phone. We&apos;ll send you a reset link.
          </p>
        </div>

        <div className="rounded-2xl border bg-card px-7 py-6 shadow-sm">
          {done ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="size-8 text-emerald-500" />
              </div>
              <div>
                <h2 className="font-bold">Check your inbox</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  If an account exists for{" "}
                  <span className="font-medium text-foreground">{identifier}</span>, a reset link
                  has been sent. Check your email (and spam folder).
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  In development, the link is printed in the backend server logs.
                </p>
              </div>
              <button
                onClick={() => { setDone(false); setIdentifier(""); }}
                className="mt-1 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Try a different email or phone
              </button>
            </div>
          ) : (
            /* ── Form ── */
            <div className="space-y-4">
              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-foreground/60">
                  Email or phone number
                </label>
                <div className="relative">
                  {identifier.includes("@") ? (
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
                  ) : (
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
                  )}
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

              <button
                onClick={handleSubmit}
                disabled={loading || !identifier.trim()}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:bg-primary/90 hover:-translate-y-px hover:shadow-lg active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending…
                  </>
                ) : (
                  <>Send reset link <ArrowRight className="size-4" /></>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Back to login */}
        <div className="mt-5 flex justify-center">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
