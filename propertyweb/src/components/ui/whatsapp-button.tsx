"use client";

import { MessageCircle } from "lucide-react";
import { buildWhatsAppURL, buildPropertyMessage } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const FALLBACK_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS ?? "919999999999";

export function WhatsAppButton({
  phone,
  property,
  variant = "full",
  className,
}: {
  phone?: string | null;
  property: { title: string; locality: string; price: string };
  variant?: "full" | "icon";
  className?: string;
}) {
  const message = buildPropertyMessage(property);
  const url = buildWhatsAppURL(phone || FALLBACK_PHONE, message);

  if (variant === "icon") {
    return (
      <button
        onClick={() => window.open(url, "_blank")}
        className={cn(
          "flex size-10 items-center justify-center rounded-full bg-green-50 text-green-600 transition-colors hover:bg-green-100",
          className
        )}
        title="WhatsApp"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="size-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => window.open(url, "_blank")}
      className={cn(
        "flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-semibold text-white transition-colors hover:bg-[#1da851]",
        className
      )}
    >
      <MessageCircle className="size-[18px]" />
      Chat on WhatsApp
    </button>
  );
}
