"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

/**
 * Reusable confirmation dialog for destructive actions (block user, disable
 * locality, reject listing, etc).
 *
 * Pattern:
 *
 *   const confirm = useConfirm();
 *   async function block(u) {
 *     if (!(await confirm({
 *       title: `Block ${u.fullName}?`,
 *       body: "They won't be able to sign in. Their listings stay visible.",
 *       confirmText: "Block user",
 *       tone: "danger",
 *     }))) return;
 *     await apiFetch(...);
 *   }
 *   return <>{confirm.dialog}{tableUI}</>;
 */
type ConfirmOptions = {
  title: string;
  body?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  tone?: "danger" | "neutral";
};

export function useConfirm() {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions>({ title: "" });
  const [resolver, setResolver] = useState<((ok: boolean) => void) | null>(null);

  const ask = (options: ConfirmOptions) =>
    new Promise<boolean>((resolve) => {
      setOpts(options);
      setResolver(() => resolve);
      setOpen(true);
    });

  function close(ok: boolean) {
    setOpen(false);
    resolver?.(ok);
    setResolver(null);
  }

  const dialog = (
    <Dialog open={open} onOpenChange={(v) => !v && close(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {opts.tone === "danger" && (
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-bold tracking-tight">
                {opts.title}
              </DialogTitle>
              {opts.body && (
                <DialogDescription className="mt-1.5 text-sm leading-relaxed">
                  {opts.body}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-2 gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => close(false)} className="min-w-[90px]">
            {opts.cancelText ?? "Cancel"}
          </Button>
          <Button
            variant={opts.tone === "danger" ? "destructive" : "default"}
            onClick={() => close(true)}
            className="min-w-[90px]"
            autoFocus
          >
            {opts.confirmText ?? "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { ask, dialog };
}
