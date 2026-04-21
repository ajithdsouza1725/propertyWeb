"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { ApprovalBox } from "@/components/admin/approval-box";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent as EditDialogContent, DialogHeader as EditDialogHeader, DialogTitle as EditDialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatINR } from "@/lib/format";
import { apiFetch, getApiErrorMessage, mediaAbsoluteUrl } from "@/lib/api";
import { propertyTypeBadgeClass } from "@/lib/property-type-style";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminDashboardApiEnabled } from "@/lib/admin-dev";
import { useAccessToken } from "@/lib/use-access-token";
import {
  ArrowLeft,
  Bed,
  Bath,
  Maximize2,
  Car,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Eye,
  Image,
  CheckCircle2,
  XCircle,
  Clock,
  Pencil,
  Trash2,
} from "lucide-react";

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

function approvalBadge(status: string) {
  switch (status?.toLowerCase()) {
    case "approved":
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200"><CheckCircle2 className="size-3 mr-1" />Approved</Badge>;
    case "rejected":
      return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="size-3 mr-1" />Rejected</Badge>;
    default:
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200"><Clock className="size-3 mr-1" />Pending Review</Badge>;
  }
}

export default function AdminPropertyReviewPage({ params }: { params: { id: string } }) {
  const token = useAccessToken();
  const apiOk = adminDashboardApiEnabled(token);
  const [property, setProperty] = useState<any | null>(null);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);
  const [enquiriesError, setEnquiriesError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [editSaving, setEditSaving] = useState(false);
  const [similar, setSimilar] = useState<any[]>([]);
  const confirm = useConfirm();

  // Next.js 16: params may be a Promise in some contexts. We extract the id
  // safely — if it's already a plain object (client component re-render), use it directly.
  const propertyId = typeof params === "object" && "id" in params ? params.id : "";

  useEffect(() => {
    let mounted = true;
    if (!apiOk || !propertyId) { setLoading(false); return; }
    setLoading(true);
    apiFetch(`/api/admin/properties/${propertyId}`, { token: token ?? undefined })
      .then((r) => { if (!mounted) return; setProperty(r); })
      .catch(() => { if (!mounted) return; setProperty(null); })
      .finally(() => { if (!mounted) return; setLoading(false); });
    return () => { mounted = false; };
  }, [token, propertyId, apiOk]);

  // Load similar / duplicate listings
  useEffect(() => {
    if (!apiOk || !property?.id) return;
    apiFetch<any[]>(`/api/admin/properties/${property.id}/similar`, { token: token ?? undefined })
      .then((r) => setSimilar(Array.isArray(r) ? r : []))
      .catch(() => setSimilar([]));
  }, [token, property?.id, apiOk]);

  useEffect(() => {
    let mounted = true;
    if (!apiOk || !property?.id) { setEnquiries([]); return; }
    setEnquiriesLoading(true);
    setEnquiriesError(null);
    apiFetch<any[]>(`/api/admin/properties/${property.id}/enquiries`, { token: token ?? undefined })
      .then((r) => { if (!mounted) return; setEnquiries(Array.isArray(r) ? r : []); })
      .catch((e: unknown) => { if (!mounted) return; setEnquiriesError(getApiErrorMessage(e, "Could not load enquiries.")); setEnquiries([]); })
      .finally(() => { if (!mounted) return; setEnquiriesLoading(false); });
    return () => { mounted = false; };
  }, [token, property?.id, apiOk]);

  if (!apiOk) {
    return <div className="py-10 text-center text-sm text-muted-foreground">Please login as admin.</div>;
  }
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl border bg-muted/40" />
        ))}
      </div>
    );
  }
  if (!property) {
    return <div className="py-10 text-center text-sm text-muted-foreground">Property not found.</div>;
  }

  const images: any[] = property.images ?? [];
  const amenities: string[] = property.amenities ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground -ml-2">
              <Link href="/admin/properties">
                <ArrowLeft className="size-4 mr-1" /> All Properties
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {approvalBadge(property.approvalStatus)}
            {property.isFeatured && <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Featured</Badge>}
            {property.purpose && (
              <Badge variant="outline" className="capitalize">{property.purpose.toLowerCase()}</Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{property.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="size-3.5" />
            {[property.addressLine, property.locality, property.city].filter(Boolean).join(", ")}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-700">{formatINR(Number(property.price ?? 0))}</div>
          {property.areaSqft && (
            <div className="text-xs text-muted-foreground mt-0.5">
              ₹{Math.round(Number(property.price) / Number(property.areaSqft)).toLocaleString("en-IN")}/sqft
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main content */}
        <section className="space-y-5 lg:col-span-8">

          {/* Images */}
          {images.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Image className="size-4 text-muted-foreground" />
                  Photos ({images.length})
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {images.map((img, i) => (
                    <a key={img.id} href={mediaAbsoluteUrl(img.imageUrl)} target="_blank" rel="noopener noreferrer">
                      <img
                        src={mediaAbsoluteUrl(img.imageUrl)}
                        alt={img.altText ?? `Photo ${i + 1}`}
                        className="aspect-video w-full rounded-xl border object-cover hover:opacity-90 transition-opacity"
                      />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Property Specs */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 font-semibold flex items-center gap-2">
                <Building2 className="size-4 text-muted-foreground" />
                Property Details
              </div>
              {/* Key specs pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {property.bedrooms != null && (
                  <div className="flex items-center gap-1.5 rounded-lg border bg-muted/30 px-3 py-1.5 text-sm">
                    <Bed className="size-4 text-muted-foreground" />
                    <span className="font-medium">{property.bedrooms}</span>
                    <span className="text-muted-foreground">Beds</span>
                  </div>
                )}
                {property.bathrooms != null && (
                  <div className="flex items-center gap-1.5 rounded-lg border bg-muted/30 px-3 py-1.5 text-sm">
                    <Bath className="size-4 text-muted-foreground" />
                    <span className="font-medium">{property.bathrooms}</span>
                    <span className="text-muted-foreground">Baths</span>
                  </div>
                )}
                {property.areaSqft != null && (
                  <div className="flex items-center gap-1.5 rounded-lg border bg-muted/30 px-3 py-1.5 text-sm">
                    <Maximize2 className="size-4 text-muted-foreground" />
                    <span className="font-medium">{property.areaSqft.toLocaleString("en-IN")}</span>
                    <span className="text-muted-foreground">sqft</span>
                  </div>
                )}
                {property.parkingCount != null && property.parkingCount > 0 && (
                  <div className="flex items-center gap-1.5 rounded-lg border bg-muted/30 px-3 py-1.5 text-sm">
                    <Car className="size-4 text-muted-foreground" />
                    <span className="font-medium">{property.parkingCount}</span>
                    <span className="text-muted-foreground">Parking</span>
                  </div>
                )}
              </div>
              <Separator className="mb-3" />
              <div className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <div className="space-y-0 sm:pr-4">
                  {property.propertyType ? (
                    <div className="flex items-start justify-between gap-4 py-2">
                      <span className="text-sm text-muted-foreground shrink-0">Property Type</span>
                      <span
                        className={cn(
                          "text-sm font-semibold rounded-md px-2 py-0.5 shrink-0",
                          propertyTypeBadgeClass(String(property.propertyTypeSlug ?? ""))
                        )}
                      >
                        {property.propertyType}
                      </span>
                    </div>
                  ) : null}
                  <DetailRow label="Purpose" value={property.purpose?.toLowerCase()} />
                  <DetailRow label="Locality" value={property.locality} />
                  <DetailRow label="City" value={property.city} />
                  <DetailRow label="Pincode" value={property.pincode} />
                  <DetailRow label="Carpet Area" value={property.carpetAreaSqft ? `${property.carpetAreaSqft} sqft` : null} />
                  <DetailRow label="Furnishing" value={property.furnishingStatus} />
                </div>
                <div className="space-y-0 sm:pl-4">
                  <DetailRow label="Floor" value={property.floorNumber != null ? `${property.floorNumber} of ${property.totalFloors ?? "?"}` : null} />
                  <DetailRow label="Facing" value={property.facing} />
                  <DetailRow label="Possession" value={property.possessionStatus} />
                  <DetailRow label="Ownership" value={property.ownershipType} />
                  <DetailRow label="Property Age" value={property.propertyAge != null ? `${property.propertyAge} yrs` : null} />
                  <DetailRow label="Security Deposit" value={property.securityDeposit ? formatINR(Number(property.securityDeposit)) : null} />
                  <DetailRow label="Views" value={property.viewsCount} />
                </div>
              </div>
              {property.description && (
                <>
                  <Separator className="my-3" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{property.description}</p>
                </>
              )}
              {property.rejectionReason && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  <strong>Rejection reason:</strong> {property.rejectionReason}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Amenities */}
          {amenities.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <div className="mb-3 font-semibold text-sm">Amenities</div>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a) => (
                    <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enquiries / Leads */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-1 font-semibold flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                Buyer Leads ({enquiries.length})
              </div>
              <p className="mb-4 text-xs text-muted-foreground">All enquiries submitted on this listing's public page.</p>
              {enquiriesError && (
                <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{enquiriesError}</div>
              )}
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Buyer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enquiriesLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">Loading…</TableCell>
                      </TableRow>
                    ) : enquiries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                          No leads yet for this property.
                        </TableCell>
                      </TableRow>
                    ) : (
                      enquiries.map((en) => (
                        <TableRow key={en.id}>
                          <TableCell>
                            <div className="font-medium text-sm">{en.buyerName ?? "—"}</div>
                          </TableCell>
                          <TableCell>
                            {en.buyerPhone && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="size-3" /> {en.buyerPhone}
                              </div>
                            )}
                            {en.buyerEmail && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="size-3" /> {en.buyerEmail}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="max-w-50">
                            <p className="line-clamp-2 text-xs text-muted-foreground">{en.message ?? "—"}</p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                en.status === "NEW"
                                  ? "border-blue-200 text-blue-700"
                                  : en.status === "ASSIGNED"
                                  ? "border-amber-200 text-amber-700"
                                  : en.status === "CLOSED"
                                  ? "border-emerald-200 text-emerald-700"
                                  : ""
                              }
                            >
                              {(en.status ?? "NEW").toLowerCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {en.assignedSellerName ? (
                              <span className="font-medium text-foreground">{en.assignedSellerName}</span>
                            ) : "Unassigned"}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {en.createdAt ? new Date(en.createdAt).toLocaleDateString("en-IN") : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <ApprovalBox
              propertyId={Number(property.id)}
              propertyTitle={property.title}
              initialStatus={
                property.approvalStatus === "approved"
                  ? "approved"
                  : property.approvalStatus === "rejected"
                  ? "rejected"
                  : "pending"
              }
              initialReason={property.rejectionReason ?? null}
              onChanged={(next) => {
                // Update local property state so badges/buttons refresh immediately
                setProperty((prev: any) => prev ? {
                  ...prev,
                  approvalStatus: next.approvalStatus,
                  rejectionReason: next.rejectionReason ?? prev.rejectionReason,
                } : prev);
              }}
            />

            {/* Duplicate / Similar Listings Warning */}
            {similar.length > 0 && (
              <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="size-4 text-amber-600" />
                    <span className="text-sm font-bold text-amber-900">{similar.length} similar listing{similar.length > 1 ? "s" : ""} found</span>
                  </div>
                  <p className="text-xs text-amber-800 mb-3">Same locality + type with similar price/area. Review before approving.</p>
                  <div className="space-y-2">
                    {similar.map((s: any) => (
                      <Link
                        key={s.id}
                        href={`/admin/properties/${s.id}`}
                        className="flex items-center justify-between rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs hover:bg-amber-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate">{s.title}</div>
                          <div className="text-muted-foreground">{s.locality} · ₹{(s.price / 100000).toFixed(1)}L</div>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-[10px] ml-2">{s.approvalStatus}</Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admin Edit Property */}
            <Button
              className="w-full"
              variant="outline"
              onClick={() => {
                setEditForm({
                  title: property.title ?? "",
                  description: property.description ?? "",
                  price: property.price ?? "",
                  bedrooms: property.bedrooms ?? "",
                  bathrooms: property.bathrooms ?? "",
                  areaSqft: property.areaSqft ?? "",
                  addressLine: property.addressLine ?? "",
                  city: property.city ?? "",
                  furnishingStatus: property.furnishingStatus ?? "",
                  isFeatured: property.isFeatured ?? false,
                  isVerified: property.isVerified ?? false,
                });
                setEditOpen(true);
              }}
            >
              <Pencil className="size-4 mr-2" /> Edit property
            </Button>

            {/* Seller Card */}
            <Card>
              <CardContent className="p-4">
                <div className="mb-3 font-semibold text-sm flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  Seller Details
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="font-medium">{property.sellerName ?? "—"}</div>
                    {property.sellerBusinessName && (
                      <div className="text-xs text-muted-foreground">{property.sellerBusinessName}</div>
                    )}
                    <Badge variant="outline" className="mt-1 text-xs capitalize">
                      {property.sellerRole?.toLowerCase() ?? "seller"}
                    </Badge>
                  </div>
                  <Separator />
                  {property.sellerEmail && (
                    <a href={`mailto:${property.sellerEmail}`} className="flex items-center gap-2 text-sm hover:underline">
                      <Mail className="size-4 text-muted-foreground" />
                      {property.sellerEmail}
                    </a>
                  )}
                  {property.sellerPhone && (
                    <a href={`tel:${property.sellerPhone}`} className="flex items-center gap-2 text-sm hover:underline">
                      <Phone className="size-4 text-muted-foreground" />
                      {property.sellerPhone}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* View on site */}
            {property.approvalStatus === "approved" && property.slug && (
              <Button variant="outline" className="w-full" asChild>
                <a href={`/property/${property.slug}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="size-4 mr-2" /> View on Website
                </a>
              </Button>
            )}
          </div>
        </aside>
      </div>

      {/* Edit Property Dialog */}
      {confirm.dialog}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <EditDialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <EditDialogHeader>
            <EditDialogTitle>Edit property</EditDialogTitle>
          </EditDialogHeader>
          <div className="grid gap-3 mt-2">
            <label className="grid gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Title</span>
              <Input value={editForm.title ?? ""} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            </label>
            <label className="grid gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Description</span>
              <Textarea rows={3} value={editForm.description ?? ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Price (₹)</span>
                <Input type="number" value={editForm.price ?? ""} onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) || "" })} />
              </label>
              <label className="grid gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Area (sqft)</span>
                <Input type="number" value={editForm.areaSqft ?? ""} onChange={(e) => setEditForm({ ...editForm, areaSqft: Number(e.target.value) || "" })} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Bedrooms</span>
                <Input type="number" value={editForm.bedrooms ?? ""} onChange={(e) => setEditForm({ ...editForm, bedrooms: Number(e.target.value) || "" })} />
              </label>
              <label className="grid gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Bathrooms</span>
                <Input type="number" value={editForm.bathrooms ?? ""} onChange={(e) => setEditForm({ ...editForm, bathrooms: Number(e.target.value) || "" })} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Address</span>
                <Input value={editForm.addressLine ?? ""} onChange={(e) => setEditForm({ ...editForm, addressLine: e.target.value })} />
              </label>
              <label className="grid gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">City</span>
                <Input value={editForm.city ?? ""} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
              </label>
            </div>
            <label className="grid gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Furnishing</span>
              <select
                className="h-9 rounded-lg border bg-background px-3 text-sm"
                value={editForm.furnishingStatus ?? ""}
                onChange={(e) => setEditForm({ ...editForm, furnishingStatus: e.target.value || null })}
              >
                <option value="">Not set</option>
                <option value="furnished">Furnished</option>
                <option value="semi-furnished">Semi-furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editForm.isFeatured ?? false} onChange={(e) => setEditForm({ ...editForm, isFeatured: e.target.checked })} className="size-4 rounded border accent-primary" />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editForm.isVerified ?? false} onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })} className="size-4 rounded border accent-primary" />
                Verified
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editSaving}>Cancel</Button>
              <Button
                disabled={editSaving}
                onClick={async () => {
                  setEditSaving(true);
                  try {
                    await apiFetch(`/api/admin/properties/${property.id}`, {
                      token: token ?? undefined,
                      method: "PUT",
                      body: editForm,
                    });
                    setEditOpen(false);
                    // Reload property data
                    const fresh = await apiFetch(`/api/admin/properties/${property.id}`, { token: token ?? undefined });
                    setProperty(fresh);
                  } catch {} finally { setEditSaving(false); }
                }}
              >
                {editSaving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </EditDialogContent>
      </Dialog>
    </div>
  );
}
