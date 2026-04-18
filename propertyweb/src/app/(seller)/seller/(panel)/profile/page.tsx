"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

import { useAccessToken } from "@/lib/use-access-token";

type Me = {
  id: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  businessName: string | null;
  role: string;
  status: string;
};

export default function SellerProfilePage() {
  const token = useAccessToken();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let mounted = true;
    if (!token) {
      setLoading(false);
      return;
    }
    apiFetch<Me>("/api/seller/profile", { token })
      .then((me) => {
        if (!mounted) return;
        setFullName(me.fullName ?? "");
        setEmail(me.email ?? "");
        setPhone(me.phone ?? "");
        setBusinessName(me.businessName ?? "");
      })
      .catch(() => {
        if (!mounted) return;
        setError("Could not load profile.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile & settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update your details and change password.</p>
      </div>

      {!token ? (
        <div className="text-sm text-muted-foreground">Please sign in to manage your profile.</div>
      ) : null}
      {error ? <div className="rounded-xl border bg-muted/30 p-3 text-sm">{error}</div> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-muted/60">
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Input
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading || !token}
            />
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || !token}
            />
            <Input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading || !token}
            />
            <Input
              placeholder="Business name (optional)"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              disabled={loading || !token}
            />
            <div className="flex justify-end">
              <Button
                disabled={saving || loading || !token || !fullName.trim()}
                onClick={async () => {
                  if (!token) return;
                  setSaving(true);
                  setError(null);
                  try {
                    await apiFetch<Me>("/api/seller/profile", {
                      token,
                      method: "PUT",
                      body: {
                        fullName: fullName.trim(),
                        email: email.trim() || null,
                        phone: phone.trim() || null,
                        businessName: businessName.trim() || null,
                      },
                    });
                  } catch (e: unknown) {
                    const err = e as { message?: string };
                    setError(err?.message ?? "Save failed");
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/60">
          <CardHeader>
            <CardTitle className="text-base">Change password</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={!token}
            />
            <Input
              type="password"
              placeholder="New password (min 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={!token}
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={!token}
            />
            <div className="flex justify-end">
              <Button
                variant="secondary"
                disabled={
                  pwLoading ||
                  !token ||
                  !currentPassword ||
                  newPassword.length < 8 ||
                  newPassword !== confirmPassword
                }
                onClick={async () => {
                  if (!token) return;
                  setPwLoading(true);
                  setError(null);
                  try {
                    await apiFetch("/api/seller/profile/password", {
                      token,
                      method: "POST",
                      body: { currentPassword, newPassword },
                    });
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  } catch (e: unknown) {
                    const err = e as { message?: string };
                    setError(err?.message ?? "Password update failed");
                  } finally {
                    setPwLoading(false);
                  }
                }}
              >
                {pwLoading ? "Updating…" : "Update password"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
