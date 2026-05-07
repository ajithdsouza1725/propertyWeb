import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Phone, Mail, MapPin } from "lucide-react";

function str(v: unknown, fallback: string) {
  if (typeof v === "string" && v.trim()) return v.trim();
  return fallback;
}

export async function SiteFooter() {
  let siteName = "MangaloreHomes";
  let supportPhone = "+91 98XX-XXX-XXX";
  let supportEmail = "support@mangalorehomes.in";
  try {
    const s = await apiFetch<Record<string, unknown>>("/api/public/cms/settings");
    siteName = str(s.siteName, siteName);
    supportPhone = str(s.supportPhone, supportPhone);
    supportEmail = str(s.supportEmail, supportEmail);
  } catch {
    // defaults
  }

  return (
    <footer className="bg-brand-deep text-white">
      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Column 1 — Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                <svg viewBox="0 0 20 20" className="size-5 text-white" fill="currentColor">
                  <path d="M10 2.5L2 9h2v8.5h4.5V13h3v4.5H16V9h2L10 2.5z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">{siteName}</span>
            </div>
            <p className="mt-4 text-sm text-white/60 leading-relaxed">
              Mangalore&apos;s trusted property marketplace. Browse verified listings,
              connect with genuine owners and agents, and find your dream home.
            </p>

            {/* Contact info */}
            <div className="mt-6 space-y-3">
              <a
                href={`tel:${supportPhone.replace(/\s/g, "")}`}
                className="group flex items-center gap-3 text-sm text-white/70 transition-colors hover:text-white"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-white/10">
                  <Phone className="size-4" />
                </div>
                {supportPhone}
              </a>
              <a
                href={`mailto:${supportEmail}`}
                className="group flex items-center gap-3 text-sm text-white/70 transition-colors hover:text-white"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-white/10">
                  <Mail className="size-4" />
                </div>
                {supportEmail}
              </a>
              <div className="flex items-center gap-3 text-sm text-white/70">
                <div className="flex size-9 items-center justify-center rounded-lg bg-white/10">
                  <MapPin className="size-4" />
                </div>
                Mangalore, Karnataka, India
              </div>
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/listings?purpose=buy", label: "Buy Property" },
                { href: "/listings?purpose=rent", label: "Rent Property" },
                { href: "/list-your-property", label: "Sell Property" },
                { href: "/seller/properties/new", label: "Post Property" },
                { href: "/localities", label: "All Localities" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/60 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Property Types */}
          <div className="md:col-span-2">
            <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
              Property Types
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/listings?type=apartments", label: "Apartments" },
                { href: "/listings?type=houses", label: "Houses" },
                { href: "/listings?type=villas", label: "Villas" },
                { href: "/listings?type=plots-land", label: "Plots & Land" },
                { href: "/listings?type=commercial", label: "Commercial" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/60 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Company */}
          <div className="md:col-span-2">
            <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
              Company
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
                { href: "/login", label: "Sign In" },
                { href: "/terms", label: "Terms" },
                { href: "/privacy", label: "Privacy" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/60 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 mt-0">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-6 sm:flex-row">
          <span className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </span>
          <div className="flex gap-5">
            <Link href="/privacy" className="text-xs text-white/40 transition-colors hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-white/40 transition-colors hover:text-white">
              Terms
            </Link>
            <Link href="/contact" className="text-xs text-white/40 transition-colors hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
