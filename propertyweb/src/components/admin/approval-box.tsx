"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { adminDashboardApiEnabled } from "@/lib/admin-dev";
import { useAccessToken } from "@/lib/use-access-token";
import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";

function statusBadge(s: string) {
  if (s === "approved")
    return (
      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1">
        <CheckCircle2 className="size-3" /> Approved
      </Badge>
    );
  if (s === "rejected")
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 gap-1">
        <XCircle className="size-3" /> Rejected
      </Badge>
    );
  return (
    <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1">
      <Clock className="size-3" /> Pending
    </Badge>
  );
}

export function ApprovalBox({
  propertyId,
  propertyTitle,
  initialStatus,
  initialReason,
  onChanged,
}: {
  propertyId: number;
  propertyTitle?: string;
  initialStatus: "pending" | "approved" | "rejected";
  initialReason?: string | null;
  onChanged?: (next: { approvalStatus: string; rejectionReason?: string | null }) => void;
}) {
  const [reason, setReason] = useState(initialReason ?? "");
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(initialStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openApprove, setOpenApprove] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const token = useAccessToken();
  const apiOk = adminDashboardApiEnabled(token);

  async function doApprove() {
    if (!apiOk) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/properties/${propertyId}/approve`, {
        token: token ?? undefined,
        method: "POST",
      });
      setStatus("approved");
      setReason("");
      onChanged?.({ approvalStatus: "approved", rejectionReason: null });
      setOpenApprove(false);
    } catch {
      setError("Failed to approve. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  async function doReject() {
    if (!apiOk) return;
    const r = reason.trim() || "Rejected by admin";
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/properties/${propertyId}/reject`, {
        token: token ?? undefined,
        method: "POST",
        body: { reason: r },
      });
      setStatus("rejected");
      setReason(r);
      onChanged?.({ approvalStatus: "rejected", rejectionReason: r });
      setOpenReject(false);
    } catch {
      setError("Failed to reject. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Approval</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current status — always visible, updates in real-time */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          {statusBadge(status)}
        </div>

        {/* Show rejection reason if rejected */}
        {status === "rejected" && reason && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <strong>Reason:</strong> {reason}
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Actions — shown only when relevant */}
        {status === "pending" && (
          <>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Rejection reason (required if rejecting)"
              rows={3}
            />
            <div className="grid gap-2">
              <Button disabled={saving || !apiOk} onClick={() => setOpenApprove(true)}>
                {saving ? "Saving…" : "Approve listing"}
              </Button>
              <Button
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50"
                disabled={saving || !apiOk || !reason.trim()}
                onClick={() => setOpenReject(true)}
              >
                Reject listing
              </Button>
              {!reason.trim() && (
                <p className="text-[11px] text-muted-foreground">
                  Enter a rejection reason above to enable the Reject button.
                </p>
              )}
            </div>
          </>
        )}

        {status === "approved" && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This listing is live. You can reject it to take it down.
            </p>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for taking it down"
              rows={2}
            />
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-700 hover:bg-red-50"
              disabled={saving || !apiOk || !reason.trim()}
              onClick={() => setOpenReject(true)}
            >
              Take down listing
            </Button>
          </div>
        )}

        {status === "rejected" && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This listing is hidden. You can re-approve it.
            </p>
            <Button disabled={saving || !apiOk} onClick={() => setOpenApprove(true)} className="w-full">
              Re-approve listing
            </Button>
          </div>
        )}
      </CardContent>

      {/* Approve confirmation */}
      <Dialog open={openApprove} onOpenChange={setOpenApprove}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve this listing?</DialogTitle>
            <DialogDescription>
              {propertyTitle ? `"${propertyTitle}" ` : "This property "}
              will go live on the public site immediately. Buyers will be able to view and
              enquire.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpenApprove(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={doApprove} disabled={saving}>
              {saving ? "Approving…" : "Yes, approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject confirmation */}
      <Dialog open={openReject} onOpenChange={setOpenReject}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <DialogTitle>Reject this listing?</DialogTitle>
                <DialogDescription className="mt-1">
                  The listing will be hidden from buyers. The seller will see your reason
                  and can fix and resubmit.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="rounded-xl border bg-muted/30 p-3 text-sm">
            <div className="text-[11px] font-medium text-muted-foreground mb-1">Rejection reason</div>
            {reason.trim() || "Rejected by admin"}
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpenReject(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={doReject} disabled={saving}>
              {saving ? "Rejecting…" : "Reject listing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
