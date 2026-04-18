"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiFetch, getApiErrorMessage } from "@/lib/api";
import type { PageResponse } from "@/lib/page-response";
import { logout } from "@/lib/auth";
import { useAccessToken } from "@/lib/use-access-token";
import { Bell, LogOut, Search, User, ChevronRight } from "lucide-react";

function searchBasePath(pathname: string): string | null {
  if (pathname.startsWith("/admin/properties")) return "/admin/properties";
  if (pathname.startsWith("/admin/users")) return "/admin/users";
  if (pathname.startsWith("/admin/enquiries")) return "/admin/enquiries";
  if (pathname.startsWith("/seller/properties")) return "/seller/properties";
  if (pathname.startsWith("/seller/enquiries")) return "/seller/enquiries";
  if (pathname.startsWith("/admin")) return "/admin/properties";
  if (pathname.startsWith("/seller")) return "/seller/properties";
  return null;
}

function initials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

/** Extract a nice page title from pathname */
function pageTitle(p: string): string {
  const seg = p.split("/").filter(Boolean).pop() ?? "Dashboard";
  return seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type InAppNotification = {
  id: number;
  title?: string | null;
  message?: string | null;
  read?: boolean;
  createdAt?: string | null;
};

type Me = { fullName?: string | null; role?: string };

export function AppTopbar({ placeholder }: { placeholder?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const base = useMemo(() => searchBasePath(pathname), [pathname]);
  const [value, setValue] = useState("");
  const token = useAccessToken();

  const [me, setMe] = useState<Me | null>(null);
  const [unread, setUnread] = useState(0);
  const [notifItems, setNotifItems] = useState<InAppNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setMe(null); return; }
    apiFetch<Me>("/api/auth/me", { token }).then(setMe).catch(() => setMe(null));
  }, [token]);

  const refreshNotifications = useCallback(async () => {
    if (!token) { setUnread(0); setNotifItems([]); return; }
    setNotifLoading(true);
    setNotifError(null);
    try {
      const [countRes, page] = await Promise.all([
        apiFetch<{ count?: number }>("/api/account/notifications/unread-count", { token }),
        apiFetch<PageResponse<InAppNotification>>("/api/account/notifications?page=0&size=12", { token }),
      ]);
      setUnread(typeof countRes.count === "number" ? countRes.count : 0);
      setNotifItems(Array.isArray(page.content) ? page.content : []);
    } catch (e: unknown) {
      setNotifError(getApiErrorMessage(e, "Could not load notifications"));
      setUnread(0);
      setNotifItems([]);
    } finally {
      setNotifLoading(false);
    }
  }, [token]);

  useEffect(() => { void refreshNotifications(); }, [refreshNotifications]);
  useEffect(() => { setValue(searchParams.get("q") ?? ""); }, [searchParams]);

  const searchEnabled = base != null;
  const notificationsMoreHref = pathname.startsWith("/admin") ? "/admin/enquiries" : "/seller/enquiries";
  const userInitials = me?.fullName ? initials(me.fullName) : (me?.role ? me.role[0]?.toUpperCase() : "U") ?? "U";
  const isAdmin = pathname.startsWith("/admin");
  const title = pageTitle(pathname);

  return (
    <div className="flex items-center justify-between gap-4 border-b bg-background px-6 py-3">
      {/* Left: page title breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm min-w-0">
        <Link href={isAdmin ? "/admin" : "/seller"} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          {isAdmin ? "Admin" : "Seller"}
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/50 shrink-0" />
        <span className="font-semibold text-foreground truncate">{title}</span>
      </div>

      {/* Center: search */}
      <form
        className="max-w-md flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          if (!base) return;
          const sp = new URLSearchParams(searchParams.toString());
          const q = value.trim();
          if (q) sp.set("q", q); else sp.delete("q");
          sp.delete("page");
          router.push(`${base}?${sp.toString()}`);
        }}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/50" />
          <input
            name="q"
            type="text"
            placeholder={placeholder ?? "Search…"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={!searchEnabled}
            aria-label="Search"
            className="h-9 w-full rounded-lg border bg-muted/40 pl-9 pr-4 text-sm transition-colors placeholder:text-muted-foreground/50 focus:border-primary/40 focus:bg-background focus:outline-none disabled:opacity-40"
          />
        </div>
      </form>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notifications */}
        <DropdownMenu onOpenChange={(open) => open && void refreshNotifications()}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex size-9 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Bell className="size-4" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-xl p-1.5 text-sm">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="font-semibold">Notifications</span>
              {token && unread > 0 && (
                <button
                  className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
                  disabled={notifLoading}
                  onClick={async () => {
                    if (!token) return;
                    try {
                      await apiFetch("/api/account/notifications/read-all", { token, method: "POST" });
                      await refreshNotifications();
                    } catch {}
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>
            <DropdownMenuSeparator />
            {!token ? (
              <p className="px-3 py-3 text-sm text-muted-foreground">Login to see notifications.</p>
            ) : notifError ? (
              <p className="px-3 py-3 text-sm text-destructive">{notifError}</p>
            ) : notifLoading && notifItems.length === 0 ? (
              <p className="px-3 py-3 text-sm text-muted-foreground">Loading…</p>
            ) : notifItems.length === 0 ? (
              <p className="px-3 py-3 text-sm text-muted-foreground">You&apos;re all caught up.</p>
            ) : (
              <div className="max-h-72 overflow-y-auto">
                {notifItems.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex-col items-start gap-0.5 whitespace-normal rounded-lg px-3 py-2"
                    onClick={async () => {
                      if (!token || n.read) return;
                      try {
                        await apiFetch(`/api/account/notifications/${n.id}/read`, { token, method: "POST" });
                        await refreshNotifications();
                      } catch {}
                    }}
                  >
                    <span className={n.read ? "text-muted-foreground" : "font-medium"}>{n.title ?? "Update"}</span>
                    {n.message && <span className="line-clamp-2 text-xs text-muted-foreground">{n.message}</span>}
                  </DropdownMenuItem>
                ))}
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="rounded-lg">
              <Link href={notificationsMoreHref}>View all enquiries</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-soft transition-all hover:opacity-90"
            >
              {userInitials || <User className="size-4" />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5 text-sm">
            {me?.fullName && (
              <>
                <div className="px-3 py-2">
                  <div className="font-semibold text-foreground">{me.fullName}</div>
                  <div className="text-xs capitalize text-muted-foreground">{me.role ?? ""}</div>
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem asChild className="rounded-lg">
              <Link href="/" className="flex items-center gap-2 px-3 py-2">
                Go to website
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-destructive focus:bg-destructive/5 focus:text-destructive"
              onClick={() => logout()}
            >
              <LogOut className="size-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
