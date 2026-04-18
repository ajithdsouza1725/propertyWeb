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
    <footer className="relative overflow-hidden bg-[oklch(0.13_0.01_260)] text-white">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-10 size-72 rounded-full bg-[--brand-2]/10 blur-3xl" />

      {/* Newsletter strip */}
      <div className="relative border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Get new listings in your inbox</h3>
              <p className="mt-0.5 text-sm text-white/60">Be the first to know about new properties in Mangalore.</p>
            </div>
            <Link
              href="/listings"
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90"
            >
              Browse Latest <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="relative mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
                <Building2 className="size-5 text-white" />
              </div>
              <span className="text-lg font-bold">{siteName}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Mangalore&apos;s trusted property marketplace. Browse verified listings, connect with genuine owners and agents, and find your dream home.
            </p>

            {/* Contact */}
            <div className="mt-5 space-y-2.5">
              <a href={`tel:${supportPhone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 text-sm text-white/70 hover:text-white transition-colors">
                <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
                  <Phone className="size-3.5" />
                </div>
                {supportPhone}
              </a>
              <a href={`mailto:${supportEmail}`} className="flex items-center gap-2.5 text-sm text-white/70 hover:text-white transition-colors">
                <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
                  <Mail className="size-3.5" />
                </div>
                {supportEmail}
              </a>
              <div className="flex items-center gap-2.5 text-sm text-white/70">
                <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
                  <MapPin className="size-3.5" />
                </div>
                Mangalore, Karnataka, India
              </div>
            </div>

            {/* Social */}
            <div className="mt-5 flex gap-2">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <div key={i} className="flex size-9 cursor-pointer items-center justify-center rounded-xl bg-white/10 text-white/60 transition-all hover:bg-primary hover:text-white hover:scale-105">
                  <Icon className="size-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="grid gap-8 md:col-span-8 sm:grid-cols-3">
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">Properties</h4>
              <ul className="space-y-3 text-sm">
                {[
                  { href: "/listings?purpose=buy", label: "Buy Property" },
                  { href: "/listings?purpose=rent", label: "Rent Property" },
                  { href: "/list-your-property", label: "Sell / List Property" },
                  { href: "/seller/properties/new", label: "Post Property" },
                  { href: "/localities", label: "All Localities" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-white/60 transition-colors hover:text-white hover:translate-x-0.5 inline-flex items-center gap-1.5">
                      <span className="size-1 rounded-full bg-primary/60 shrink-0" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">Property Types</h4>
              <ul className="space-y-3 text-sm">
                {[
                  { href: "/listings?type=apartment", label: "Apartments" },
                  { href: "/listings?type=independent-house", label: "Independent Houses" },
                  { href: "/listings?type=villa", label: "Villas" },
                  { href: "/listings?type=plot", label: "Plots & Land" },
                  { href: "/listings?type=commercial", label: "Commercial" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-white/60 transition-colors hover:text-white inline-flex items-center gap-1.5">
                      <span className="size-1 rounded-full bg-[--brand-2]/60 shrink-0" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">Company</h4>
              <ul className="space-y-3 text-sm">
                {[
                  { href: "/about", label: "About Us" },
                  { href: "/contact", label: "Contact" },
                  { href: "/seller/login", label: "Seller Portal" },
                  { href: "/admin/login", label: "Admin Panel" },
                  { href: "/terms", label: "Terms of Service" },
                  { href: "/privacy", label: "Privacy Policy" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-white/60 transition-colors hover:text-white inline-flex items-center gap-1.5">
                      <span className="size-1 rounded-full bg-white/20 shrink-0" />
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
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/40 sm:flex-row">
          <span>© {new Date().getFullYear()} {siteName}. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
