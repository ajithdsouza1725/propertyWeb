"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { COOKIE_CONSENT_STORAGE_KEY, type CookieConsentChoice } from "@/lib/cookie-consent";

function pushConsent(choice: CookieConsentChoice) {
  const w = typeof window !== "undefined" ? window : undefined;
  const gtag = w?.gtag;
  if (typeof gtag !== "function") return;

  if (choice === "accepted") {
    gtag("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
      functionality_storage: "granted",
      personalization_storage: "granted",
    });
    return;
  }

  gtag("consent", "update", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "denied",
    personalization_storage: "denied",
  });
}

/**
 * Shown on first visit when AdSense is enabled. Stores choice in localStorage and updates Consent Mode.
 */
export function CookieConsentBanner() {
  const adsClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();
  const [hydrated, setHydrated] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!adsClient?.startsWith("ca-pub-")) return;
    setHydrated(true);
    try {
      if (!localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, [adsClient]);

  const dismiss = useCallback((choice: CookieConsentChoice) => {
    try {
      localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, choice);
    } catch {
      // ignore
    }
    pushConsent(choice);
    setVisible(false);
  }, []);

  if (!hydrated || !adsClient?.startsWith("ca-pub-") || !visible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-100 border-t bg-background/95 p-4 shadow-lg backdrop-blur-md md:p-5"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 text-sm leading-relaxed text-muted-foreground">
          <p id="cookie-consent-title" className="font-medium text-foreground">
            Cookies &amp; ads
          </p>
          <p id="cookie-consent-desc" className="mt-1">
            We use cookies and similar technologies for Google AdSense (and related measurement). Essential cookies
            keep the site working. You can accept optional cookies for personalised ads and analytics, or reject
            non-essential cookies. See our{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
          <Button type="button" variant="outline" size="sm" onClick={() => dismiss("rejected")}>
            Reject non-essential
          </Button>
          <Button type="button" size="sm" onClick={() => dismiss("accepted")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
