const LAKH = 100_000;
const CRORE = 10_000_000;
const K = 1000;

function parseSingleToken(raw: string, mode: "sale" | "rent"): number | null {
  const t = raw.trim().toLowerCase().replace(/\s+/g, "").replace(/,/g, "");
  if (!t) return null;

  const m = t.match(/^([\d.]+)(lakhs?|lac|l|cr|crore|crores|k)?$/i);
  if (m) {
    const num = parseFloat(m[1]);
    if (!Number.isFinite(num)) return null;
    const suf = (m[2] ?? "").toLowerCase();
    if (suf === "k") return Math.round(num * K);
    if (suf === "l" || suf.startsWith("lac") || suf.startsWith("lakh")) return Math.round(num * LAKH);
    if (suf.startsWith("cr")) return Math.round(num * CRORE);
    if (mode === "rent") {
      if (num < 500) return Math.round(num * K);
      return Math.round(num);
    }
    if (num < 1000) return Math.round(num * LAKH);
    return Math.round(num);
  }

  const n = Number(t);
  return Number.isFinite(n) ? Math.round(n) : null;
}

/**
 * Maps hero-search free-text budget to API min/max price (rupees). Supports ranges and Indian units (L, Cr, k).
 */
export function parseBudgetToPriceRange(
  budget: string | undefined,
  purpose: string | undefined
): { minPrice?: number; maxPrice?: number } {
  if (!budget?.trim()) return {};
  const mode = purpose === "rent" ? "rent" : "sale";
  const parts = budget
    .split(/\s*[-–—]\s*|\s+to\s+/i)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    const a = parseSingleToken(parts[0], mode);
    const b = parseSingleToken(parts[1], mode);
    if (a != null && b != null) {
      return { minPrice: Math.min(a, b), maxPrice: Math.max(a, b) };
    }
  }
  const n = parseSingleToken(parts[0] ?? budget, mode);
  if (n == null) return {};
  return { maxPrice: n };
}
