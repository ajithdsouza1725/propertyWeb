import type { Metadata } from "next";
import { AdSenseScript } from "@/components/ads/adsense-script";
import { CookieConsentBanner } from "@/components/consent/cookie-consent-banner";
import { GoogleConsentBootstrap } from "@/components/consent/google-consent-bootstrap";
import { CompareBar } from "@/components/property/compare-bar";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { API_BASE_URL } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/cms/seo`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return siteUrl ? { metadataBase: new URL(siteUrl) } : {};
    const data = (await res.json()) as Record<string, unknown>;
    const title = typeof data.title === "string" && data.title.trim() ? data.title.trim() : null;
    const description =
      typeof data.description === "string" && data.description.trim() ? data.description.trim() : null;
    const og = typeof data.ogImageUrl === "string" && data.ogImageUrl.trim() ? data.ogImageUrl.trim() : null;
    const meta: Metadata = {};
    if (siteUrl) meta.metadataBase = new URL(siteUrl);
    if (title) meta.title = title;
    if (description) meta.description = description;
    if (title || description || og) {
      meta.openGraph = {
        title: title ?? undefined,
        description: description ?? undefined,
        ...(og ? { images: [{ url: og }] } : {}),
      };
    }
    return meta;
  } catch {
    return siteUrl ? { metadataBase: new URL(siteUrl) } : {};
  }
}

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <GoogleConsentBootstrap />
      <AdSenseScript />
      <CookieConsentBanner />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <CompareBar />
      <SiteFooter />
    </div>
  );
}

