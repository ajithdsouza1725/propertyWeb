"use client";

import { useState } from "react";
import { apiFetch, getApiErrorMessage } from "@/lib/api";
// Auth handled by proxy — no direct token access needed
import { Phone, Mail, User, MessageSquare, Send, CheckCircle2, ShieldCheck } from "lucide-react";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";

export function EnquiryCard({
  propertyId,
  propertySlug,
  propertyTitle,
}: {
  propertyId?: number;
  propertySlug: string;
  propertyTitle: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    `Hi, I'm interested in "${propertyTitle}". Please share more details.`,
  );
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!name.trim() || !phone.trim()) return;
    setSending(true);
    setError(null);
    try {
      await apiFetch("/api/public/enquiries", {
        body: {
          propertyId: typeof propertyId === "number" && Number.isFinite(propertyId) ? propertyId : null,
          propertySlug,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          message: message.trim() || null,
          source: "website",
        },
      });
      setSent(true);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Failed to send enquiry. Please try again."));
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="size-7 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Enquiry sent</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Our team will verify your request and connect you with the seller shortly. Expect a
              call on <span className="font-medium text-foreground">{phone}</span>.
            </p>
          </div>
          <button
            onClick={() => {
              setSent(false);
              setName("");
              setPhone("");
              setEmail("");
            }}
            className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Send another enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
      {/* Header — brand-deep ink, matches homepage hero tone */}
      <div className="relative overflow-hidden bg-brand-deep p-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-primary/20 blur-2xl"
        />
        <div className="relative flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Get details &amp; pricing</h3>
            <p className="mt-0.5 text-xs text-white/65">Free — no account required</p>
          </div>
          <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-white">
            <MessageSquare className="size-4" />
          </div>
        </div>
      </div>

      <div className="p-5">
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <div className="space-y-3">
          <FormInput
            icon={<User className="size-4" />}
            placeholder="Your name *"
            value={name}
            onChange={setName}
            autoComplete="name"
          />
          <FormInput
            icon={<Phone className="size-4" />}
            placeholder="Phone number *"
            value={phone}
            onChange={setPhone}
            type="tel"
            autoComplete="tel"
          />
          <FormInput
            icon={<Mail className="size-4" />}
            placeholder="Email (optional)"
            value={email}
            onChange={setEmail}
            type="email"
            autoComplete="email"
          />

          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full resize-none rounded-xl border bg-muted/40 px-4 py-2.5 text-sm transition-colors placeholder:text-muted-foreground/60 focus:bg-background focus:border-primary/40 focus:outline-none"
          />

          <button
            onClick={handleSubmit}
            disabled={sending || !name.trim() || !phone.trim()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-lift transition-all hover:-translate-y-px hover:bg-primary/90 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
          >
            {sending ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Sending…
              </>
            ) : (
              <>
                <Send className="size-4" />
                Send enquiry
              </>
            )}
          </button>

          {/* WhatsApp alternative */}
          <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="mt-3">
            <WhatsAppButton
              property={{
                title: propertyTitle,
                locality: "Mangalore",
                price: "",
              }}
              variant="full"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-1.5 border-t pt-4">
          {[
            { icon: ShieldCheck, text: "Verified by admin before connecting" },
            { icon: Phone, text: "We call you — no spam" },
          ].map((t) => {
            const Ic = t.icon;
            return (
              <div key={t.text} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Ic className="size-3.5 shrink-0 text-emerald-600" />
                {t.text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FormInput({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60">
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="h-10 w-full rounded-xl border bg-muted/40 pl-10 pr-4 text-sm transition-colors placeholder:text-muted-foreground/60 focus:border-primary/40 focus:bg-background focus:outline-none"
      />
    </div>
  );
}
