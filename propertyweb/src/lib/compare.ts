/**
 * Property comparison — stores up to 3 property IDs in localStorage.
 * The compare page reads these and fetches full details for side-by-side display.
 */

const KEY = "pw_compare_ids";
const MAX = 3;

export function getCompareIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToCompare(id: number): boolean {
  const ids = getCompareIds();
  if (ids.includes(id)) return false;
  if (ids.length >= MAX) return false;
  ids.push(id);
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {}
  window.dispatchEvent(new Event("pw-compare-changed"));
  return true;
}

export function removeFromCompare(id: number) {
  const ids = getCompareIds().filter((x) => x !== id);
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {}
  window.dispatchEvent(new Event("pw-compare-changed"));
}

export function clearCompare() {
  try { localStorage.removeItem(KEY); } catch {}
  window.dispatchEvent(new Event("pw-compare-changed"));
}

export function isInCompare(id: number): boolean {
  return getCompareIds().includes(id);
}
