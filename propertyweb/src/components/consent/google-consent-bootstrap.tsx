import Script from "next/script";
import { COOKIE_CONSENT_STORAGE_KEY } from "@/lib/cookie-consent";

/**
 * Consent Mode v2 defaults (denied) before any Google tag runs; restores prior choice from localStorage.
 * Must load before the AdSense script. Only emitted when AdSense client id is configured.
 */
export function GoogleConsentBootstrap() {
  const adsClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();
  if (!adsClient?.startsWith("ca-pub-")) {
    return null;
  }

  const inline = `
(function () {
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "denied",
    personalization_storage: "denied",
    security_storage: "granted",
    wait_for_update: 500
  });
  try {
    var choice = localStorage.getItem(${JSON.stringify(COOKIE_CONSENT_STORAGE_KEY)});
    if (choice === "accepted") {
      gtag("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
        analytics_storage: "granted",
        functionality_storage: "granted",
        personalization_storage: "granted"
      });
    }
  } catch (e) {}
})();
`;

  return <Script id="google-consent-default" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: inline }} />;
}
