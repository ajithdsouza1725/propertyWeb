"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiFetch, getApiErrorMessage } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { Heart, Share2, Copy, Check, MessageCircle } from "lucide-react";

export function PropertyDetailActions({
  propertyId,
  initialSaved,
  shareTitle,
  shareUrl,
}: {
  propertyId: number;
  initialSaved: boolean;
  shareTitle: string;
  shareUrl: string;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const syncSaved = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setSaved(false);
      return;
    }
    try {
      const r = await apiFetch<{ saved: boolean }>(
        `/api/account/saved/check?propertyId=${propertyId}`,
        { token },
      );
      setSaved(Boolean(r.saved));
    } catch {
      setSaved(false);
    }
  }, [propertyId]);

  useEffect(() => {
    syncSaved();
  }, [syncSaved]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setMsg("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", shareUrl);
    }
  }

  function shareWhatsApp() {
    const text = `Check out this property: ${shareTitle}\n${shareUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener",
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {msg && <div className="text-xs text-muted-foreground">{msg}</div>}
      <div className="flex gap-2">
        {/* Save / unsave */}
        <Button
          variant={saved ? "default" : "secondary"}
          size="sm"
          className="gap-2"
          disabled={loading}
          onClick={async () => {
            const token = getAccessToken();
            if (!token) {
              window.location.href = `/login?next=${encodeURIComponent(shareUrl)}`;
              return;
            }
            setLoading(true);
            setMsg(null);
            try {
              if (saved) {
                await apiFetch(`/api/account/saved/${propertyId}`, { token, method: "DELETE" });
                setSaved(false);
                setMsg("Removed from saved.");
              } else {
                await apiFetch(`/api/account/saved/${propertyId}`, { token, method: "POST" });
                setSaved(true);
                setMsg("Saved to your list.");
              }
            } catch (e: unknown) {
              setMsg(getApiErrorMessage(e, "Could not update saved list."));
            } finally {
              setLoading(false);
            }
          }}
        >
          <Heart className={`size-4 ${saved ? "fill-current" : ""}`} />
          {saved ? "Saved" : "Save"}
        </Button>

        {/* Share dropdown: WhatsApp + Copy link */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="size-4" />
              Share
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={shareWhatsApp} className="gap-2 cursor-pointer">
              <MessageCircle className="size-4 text-emerald-600" />
              Share on WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem onClick={copyLink} className="gap-2 cursor-pointer">
              {copied ? (
                <Check className="size-4 text-emerald-600" />
              ) : (
                <Copy className="size-4" />
              )}
              {copied ? "Copied!" : "Copy link"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* WhatsApp enquiry — direct CTA, always visible */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          onClick={() => {
            const text = `Hi, I'm interested in "${shareTitle}". Can you share more details?\n\n${shareUrl}`;
            window.open(
              `https://wa.me/?text=${encodeURIComponent(text)}`,
              "_blank",
              "noopener",
            );
          }}
        >
          <MessageCircle className="size-4" />
          WhatsApp
        </Button>
      </div>
    </div>
  );
}
