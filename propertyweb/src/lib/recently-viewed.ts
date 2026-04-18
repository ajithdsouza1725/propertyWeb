/**
 * Recently-viewed property tracker. Stores a compact list of slugs + titles in
 * localStorage so the homepage and account page can show "Continue browsing".
 *
 * Limit: 12 items. FIFO eviction. No PII stored — just slug + title + timestamp.
 */

const STORAGE_KEY = "pw_recently_viewed";
const MAX_ITEMS = 12;

export type RecentlyViewedItem = {
  slug: string;
  title: string;
  viewedAt: number; // Date.now()
};

function read(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: RecentlyViewedItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // localStorage full or blocked — fail silently
  }
}

/** Record a property view. De-duplicates by slug and moves to front. */
export function trackView(slug: string, title: string) {
  const items = read().filter((i) => i.slug !== slug);
  items.unshift({ slug, title, viewedAt: Date.now() });
  write(items);
}

/** Get the recently-viewed list (most recent first). */
export function getRecentlyViewed(): RecentlyViewedItem[] {
  return read();
}

/** Clear all recently-viewed. */
export function clearRecentlyViewed() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}
