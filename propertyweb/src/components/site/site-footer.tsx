import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  ArrowRight,
  Sparkles,
} from "lucide-react";

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
    <footer className="relative overflow-hidden bg-gray-900 text-white">

      {/* Newsletter strip */}
      <div className="relative border-b border-white/15">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-amber-400" />
                <h3 className="text-xl font-black tracking-tight">Get new listings in your inbox</h3>
              </div>
              <p className="mt-1.5 text-sm text-white/70">Be the first to know about new properties in Mangalore.</p>
            </div>
            <Link
              href="/listings"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-gray-900 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Browse Latest <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="relative mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 shadow-lg backdrop-blur-sm">
                <svg viewBox="0 0 20 20" className="size-5 text-white" fill="currentColor">
                  <path d="M10 2.5L2 9h2v8.5h4.5V13h3v4.5H16V9h2L10 2.5z" />
                </svg>
              </div>
              <span className="text-xl font-black tracking-tight">{siteName}</span>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-white/65">
              Mangalore&apos;s trusted property marketplace. Browse verified listings, connect with genuine owners and agents, and find your dream home.
            </p>

            {/* Contact */}
            <div className="mt-6 space-y-3">
              <a href={`tel:${supportPhone.replace(/\s/g, "")}`} className="group flex items-center gap-3 text-sm text-white/75 transition-colors hover:text-white">
                <div className="flex size-9 items-center justify-center rounded-lg bg-white/10 transition-colors group-hover:bg-white/20">
                  <Phone className="size-4" />
                </div>
                {supportPhone}
              </a>
              <a href={`mailto:${supportEmail}`} className="group flex items-center gap-3 text-sm text-white/75 transition-colors hover:text-white">
                <div className="flex size-9 items-center justify-center rounded-lg bg-white/10 transition-colors group-hover:bg-white/20">
                  <Mail className="size-4" />
                </div>
                {supportEmail}
              </a>
              <div className="flex items-center gap-3 text-sm text-white/75">
                <div className="flex size-9 items-center justify-center rounded-lg bg-white/10">
                  <MapPin className="size-4" />
                </div>
                Mangalore, Karnataka, India
              </div>
            </div>

            {/* Social */}
            <div className="mt-6 flex gap-2.5">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <div key={i} className="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-white/10 text-white/70 transition-all hover:bg-white hover:text-gray-900 hover:scale-105">
                  <Icon className="size-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="grid gap-8 md:col-span-8 sm:grid-cols-3">
            <div>
              <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">Properties</h4>
              <ul className="space-y-3.5 text-sm">
                {[
                  { href: "/listings?purpose=buy", label: "Buy Property" },
                  { href: "/listings?purpose=rent", label: "Rent Property" },
                  { href: "/list-your-property", label: "Sell / List Property" },
                  { href: "/seller/properties/new", label: "Post Property" },
                  { href: "/localities", label: "All Localities" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="group inline-flex items-center gap-2 text-white/65 transition-all hover:text-white hover:translate-x-0.5">
                      <span className="size-1.5 rounded-full bg-white/30 transition-colors group-hover:bg-white" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">Property Types</h4>
              <ul className="space-y-3.5 text-sm">
                {[
                  { href: "/listings?type=residential", label: "Apartments" },
                  { href: "/listings?type=residential", label: "Independent Houses" },
                  { href: "/listings?type=residential", label: "Villas" },
                  { href: "/listings?type=land", label: "Plots & Land" },
                  { href: "/listings?type=commercial", label: "Commercial" },
                ].map((l, i) => (
                  <li key={i}>
                    <Link href={l.href} className="group inline-flex items-center gap-2 text-white/65 transition-all hover:text-white hover:translate-x-0.5">
                      <span className="size-1.5 rounded-full bg-white/30 transition-colors group-hover:bg-white" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">Company</h4>
              <ul className="space-y-3.5 text-sm">
                {[
                  { href: "/about", label: "About Us" },
                  { href: "/contact", label: "Contact" },
                  { href: "/login", label: "Sign In" },
                  { href: "/terms", label: "Terms of Service" },
                  { href: "/privacy", label: "Privacy Policy" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="group inline-flex items-center gap-2 text-white/65 transition-all hover:text-white hover:translate-x-0.5">
                      <span className="size-1.5 rounded-full bg-white/30 transition-colors group-hover:bg-white" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-white/50 sm:flex-row">
          <span>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</span>
          <div className="flex gap-5">
            <Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
            <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
            <Link href="/contact" className="transition-colors hover:text-white">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
