"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { SellerPropertyImagesField } from "@/components/seller/seller-property-images-field";
import { apiFetch, getApiErrorMessage } from "@/lib/api";

import { usePublicCatalog } from "@/lib/use-public-catalog";
import { useAccessToken } from "@/lib/use-access-token";

const FURNISHING_OPTIONS = ["", "Unfurnished", "Semi-furnished", "Fully furnished"] as const;
const POSSESSION_OPTIONS = [
  "",
  "Ready to move",
  "Under construction",
  "Within 3 months",
  "After 3 months",
] as const;

export default function SellerEditPropertyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const token = useAccessToken();
  const id = Number(params.id);
  const { localities, propertyTypes } = usePublicCatalog();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  const [purpose, setPurpose] = useState<"sell" | "rent">("sell");
  const [propertyTypeSlug, setPropertyTypeSlug] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("Mangalore");
  const [localitySlug, setLocalitySlug] = useState<string>("");
  const [addressLine, setAddressLine] = useState("");
  const [pincode, setPincode] = useState("");
  const [price, setPrice] = useState<string>("");
  const [securityDeposit, setSecurityDeposit] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<string>("");
  const [bathrooms, setBathrooms] = useState<string>("");
  const [areaSqft, setAreaSqft] = useState<string>("");
  const [parkingCount, setParkingCount] = useState<string>("");
  const [landRoadAccess, setLandRoadAccess] = useState<string>("");
  const [landSurveyNo, setLandSurveyNo] = useState<string>("");
  const [agriWaterSource, setAgriWaterSource] = useState<string>("");
  const [agriSoilType, setAgriSoilType] = useState<string>("");
  const [furnishingStatus, setFurnishingStatus] = useState("");
  const [possessionStatus, setPossessionStatus] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    if (!token || !Number.isFinite(id)) {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    apiFetch<any>(`/api/seller/properties/${id}`, { token })
      .then((r) => {
        if (!mounted) return;
        setData(r);
        setPurpose(String(r.purpose ?? "sell").toLowerCase() === "rent" ? "rent" : "sell");
        setPropertyTypeSlug(String(r.propertyTypeSlug ?? ""));
        setTitle(String(r.title ?? ""));
        setDescription(String(r.description ?? ""));
        setCity(String(r.city ?? "Mangalore"));
        setLocalitySlug(String(r.localitySlug ?? ""));
        setAddressLine(String(r.addressLine ?? ""));
        setPincode(String(r.pincode ?? ""));
        setPrice(r.price != null ? String(r.price) : "");
        setSecurityDeposit(r.securityDeposit != null ? String(r.securityDeposit) : "");
        setBedrooms(r.bedrooms != null ? String(r.bedrooms) : "");
        setBathrooms(r.bathrooms != null ? String(r.bathrooms) : "");
        setAreaSqft(r.areaSqft != null ? String(r.areaSqft) : "");
        setParkingCount(r.parkingCount != null ? String(r.parkingCount) : "");

        const extras = (r.extraFields ?? {}) as any;
        setLandRoadAccess(String(extras.roadAccess ?? ""));
        setLandSurveyNo(String(extras.surveyNo ?? ""));
        setAgriWaterSource(String(extras.waterSource ?? ""));
        setAgriSoilType(String(extras.soilType ?? ""));
        setFurnishingStatus(String(r.furnishingStatus ?? ""));
        setPossessionStatus(String(r.possessionStatus ?? ""));
        setImageUrls(Array.isArray(r.imageUrls) ? r.imageUrls.map((x: unknown) => String(x)) : []);
      })
      .catch((e: unknown) => {
        if (!mounted) return;
        setData(null);
        setError(getApiErrorMessage(e, "Failed to load property"));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [token, id]);

  const allowedTypes =
    purpose === "rent"
      ? propertyTypes.filter((t) => ["residential", "commercial"].includes(String(t.slug)))
      : propertyTypes;
  const ptSlug = propertyTypeSlug || allowedTypes[0]?.slug || "";
  const locSlug = localitySlug || localities[0]?.slug || "";
  const typeSlug = String(ptSlug ?? "").toLowerCase();

  const isApproved = String(data?.approvalStatus ?? "").toLowerCase() === "approved";
  const majorFieldsLocked = isApproved;

  const furnishingSelectOptions = useMemo(() => {
    const base = FURNISHING_OPTIONS.filter(Boolean) as string[];
    const t = furnishingStatus.trim();
    if (!t) return base;
    return base.includes(t) ? base : [t, ...base];
  }, [furnishingStatus]);

  const possessionSelectOptions = useMemo(() => {
    const base = POSSESSION_OPTIONS.filter(Boolean) as string[];
    const t = possessionStatus.trim();
    if (!t) return base;
    return base.includes(t) ? base : [t, ...base];
  }, [possessionStatus]);

  const validation = useMemo(() => {
    const errs: string[] = [];
    if (!token) errs.push("Please login to edit.");
    if (!title.trim()) errs.push("Title is required.");
    if (isApproved) {
      return { ok: errs.length === 0, errs };
    }
    if (!ptSlug) errs.push("Property type is required.");
    if (!locSlug) errs.push("Locality is required.");
    const priceN = Number(price);
    if (!price.trim() || !Number.isFinite(priceN) || priceN <= 0) errs.push("Valid price is required.");

    if (typeSlug === "residential") {
      const b = Number(bedrooms);
      const ba = Number(bathrooms);
      if (!Number.isFinite(b) || b <= 0) errs.push("Bedrooms are required for Residential.");
      if (!Number.isFinite(ba) || ba <= 0) errs.push("Bathrooms are required for Residential.");
    }
    if (typeSlug === "commercial") {
      const a = Number(areaSqft);
      const pk = Number(parkingCount);
      if (!Number.isFinite(a) || a <= 0) errs.push("Built-up area (sqft) is required for Commercial.");
      if (!Number.isFinite(pk) || pk <= 0) errs.push("Parking is required for Commercial.");
    }
    if (typeSlug === "land") {
      const a = Number(areaSqft);
      if (!Number.isFinite(a) || a <= 0) errs.push("Plot size (sqft) is required for Land.");
      if (!landRoadAccess.trim()) errs.push("Road access is required for Land.");
      if (!landSurveyNo.trim()) errs.push("Survey no. is required for Land.");
    }
    if (typeSlug === "agricultural-land") {
      const a = Number(areaSqft);
      if (!Number.isFinite(a) || a <= 0) errs.push("Land size (sqft) is required for Agricultural Land.");
      if (!agriWaterSource.trim()) errs.push("Water source is required for Agricultural Land.");
      if (!agriSoilType.trim()) errs.push("Soil type is required for Agricultural Land.");
    }

    return { ok: errs.length === 0, errs };
  }, [
    token,
    title,
    ptSlug,
    locSlug,
    price,
    typeSlug,
    bedrooms,
    bathrooms,
    areaSqft,
    parkingCount,
    landRoadAccess,
    landSurveyNo,
    agriWaterSource,
    agriSoilType,
    isApproved,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit property</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isApproved
              ? "Live listing: update title, description, furnishing, possession, and photos without losing approval. Price, location, or layout changes need admin review."
              : "Structural changes send the listing back to admin for approval."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {data?.slug ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/property/${data.slug}`}>View live listing</Link>
            </Button>
          ) : null}
          <Button variant="secondary" asChild>
            <Link href="/seller/properties">Back</Link>
          </Button>
        </div>
      </div>

      {error ? <div className="rounded-xl border bg-muted/30 p-4 text-sm">{error}</div> : null}
      {!error && !validation.ok && validation.errs.length ? (
        <div className="rounded-xl border bg-muted/30 p-4 text-sm">
          <div className="font-medium">Fix these to save:</div>
          <ul className="mt-2 list-disc pl-5 text-muted-foreground">
            {validation.errs.slice(0, 6).map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle className="text-base">Property details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          {!token ? (
            <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
              Please{" "}
              <Link className="font-medium text-foreground hover:underline" href="/seller/login">
                login
              </Link>{" "}
              to edit.
            </div>
          ) : loading ? (
            <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">Loading…</div>
          ) : !data ? (
            <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">Property not found.</div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted-foreground">Purpose</div>
                  <Select
                    value={purpose}
                    onValueChange={(v) => setPurpose(v as any)}
                    disabled={majorFieldsLocked}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sell">Sell</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted-foreground">Property type</div>
                  <Select
                    value={ptSlug}
                    onValueChange={(v) => setPropertyTypeSlug(v)}
                    disabled={majorFieldsLocked}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Property type" />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedTypes.map((t) => (
                        <SelectItem key={t.id} value={t.slug}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="text-xs font-medium text-muted-foreground">Title</div>
                <Input className="h-11" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted-foreground">Locality</div>
                  <Select
                    value={locSlug}
                    onValueChange={(v) => setLocalitySlug(v)}
                    disabled={majorFieldsLocked}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select locality" />
                    </SelectTrigger>
                    <SelectContent>
                      {localities.map((l) => (
                        <SelectItem key={l.id} value={l.slug}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    {purpose === "rent" ? "Monthly rent" : "Price"}
                  </div>
                  <Input
                    className="h-11"
                    inputMode="numeric"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={majorFieldsLocked}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="text-xs font-medium text-muted-foreground">Description (optional)</div>
                <Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted-foreground">Furnishing (optional)</div>
                  <Select
                    value={furnishingStatus.trim() ? furnishingStatus : "__none__"}
                    onValueChange={(v) => setFurnishingStatus(v === "__none__" ? "" : v)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not specified</SelectItem>
                      {furnishingSelectOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted-foreground">Possession (optional)</div>
                  <Select
                    value={possessionStatus.trim() ? possessionStatus : "__none__"}
                    onValueChange={(v) => setPossessionStatus(v === "__none__" ? "" : v)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not specified</SelectItem>
                      {possessionSelectOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted-foreground">City</div>
                  <Input
                    className="h-11"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={majorFieldsLocked}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted-foreground">Pincode</div>
                  <Input
                    className="h-11"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    disabled={majorFieldsLocked}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="text-xs font-medium text-muted-foreground">Address</div>
                <Input
                  className="h-11"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  disabled={majorFieldsLocked}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted-foreground">Security deposit</div>
                  <Input
                    className="h-11"
                    inputMode="numeric"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value)}
                    disabled={majorFieldsLocked}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    {typeSlug === "commercial"
                      ? "Built-up area (sqft)"
                      : typeSlug === "land"
                        ? "Plot size (sqft)"
                        : typeSlug === "agricultural-land"
                          ? "Land size (sqft)"
                          : "Area (sqft)"}
                  </div>
                  <Input
                    className="h-11"
                    inputMode="numeric"
                    value={areaSqft}
                    onChange={(e) => setAreaSqft(e.target.value)}
                    disabled={majorFieldsLocked}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted-foreground">Bedrooms</div>
                  <Input
                    className="h-11"
                    inputMode="numeric"
                    disabled={majorFieldsLocked || typeSlug !== "residential"}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted-foreground">Bathrooms</div>
                  <Input
                    className="h-11"
                    inputMode="numeric"
                    disabled={majorFieldsLocked || typeSlug !== "residential"}
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                  />
                </div>
              </div>

              {typeSlug === "commercial" ? (
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted-foreground">Parking (count)</div>
                  <Input
                    className="h-11"
                    inputMode="numeric"
                    value={parkingCount}
                    onChange={(e) => setParkingCount(e.target.value)}
                    disabled={majorFieldsLocked}
                  />
                </div>
              ) : null}

              {typeSlug === "land" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <div className="text-xs font-medium text-muted-foreground">Road access</div>
                    <Input
                      className="h-11"
                      value={landRoadAccess}
                      onChange={(e) => setLandRoadAccess(e.target.value)}
                      disabled={majorFieldsLocked}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="text-xs font-medium text-muted-foreground">Survey no.</div>
                    <Input
                      className="h-11"
                      value={landSurveyNo}
                      onChange={(e) => setLandSurveyNo(e.target.value)}
                      disabled={majorFieldsLocked}
                    />
                  </div>
                </div>
              ) : null}

              {typeSlug === "agricultural-land" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <div className="text-xs font-medium text-muted-foreground">Water source</div>
                    <Input
                      className="h-11"
                      value={agriWaterSource}
                      onChange={(e) => setAgriWaterSource(e.target.value)}
                      disabled={majorFieldsLocked}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="text-xs font-medium text-muted-foreground">Soil type</div>
                    <Input
                      className="h-11"
                      value={agriSoilType}
                      onChange={(e) => setAgriSoilType(e.target.value)}
                      disabled={majorFieldsLocked}
                    />
                  </div>
                </div>
              ) : null}

              <Separator />

              <SellerPropertyImagesField
                token={token}
                propertyId={id}
                imageUrls={imageUrls}
                onChange={setImageUrls}
              />

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                <Button variant="outline" asChild>
                  <Link href="/seller/properties">Cancel</Link>
                </Button>
                <Button
                  disabled={!validation.ok || saving}
                  onClick={async () => {
                    if (!token || !Number.isFinite(id)) return;
                    setSaving(true);
                    setError(null);
                    try {
                      const pt = propertyTypes.find((t) => t.slug === ptSlug);
                      const loc = localities.find((l) => l.slug === locSlug);
                      if (!pt) throw new Error("Please choose a property type.");
                      if (!loc) throw new Error("Please choose a locality.");
                      await apiFetch(`/api/seller/properties/${id}`, {
                        token,
                        method: "PUT",
                        body: {
                          title: title.trim(),
                          slug: "",
                          purpose,
                          propertyTypeId: pt.id,
                          localityId: loc.id,
                          price: Number(price),
                          securityDeposit: securityDeposit ? Number(securityDeposit) : null,
                          description: description.trim() || null,
                          addressLine: addressLine.trim() || null,
                          city: city.trim() || "Mangalore",
                          pincode: pincode.trim() || null,
                          bedrooms: bedrooms ? Number(bedrooms) : null,
                          bathrooms: bathrooms ? Number(bathrooms) : null,
                          areaSqft: areaSqft ? Number(areaSqft) : null,
                          parkingCount: parkingCount ? Number(parkingCount) : null,
                          furnishingStatus: furnishingStatus.trim() || null,
                          possessionStatus: possessionStatus.trim() || null,
                          extraFields: {
                            ...(typeSlug === "land"
                              ? { roadAccess: landRoadAccess.trim(), surveyNo: landSurveyNo.trim() }
                              : {}),
                            ...(typeSlug === "agricultural-land"
                              ? { waterSource: agriWaterSource.trim(), soilType: agriSoilType.trim() }
                              : {}),
                          },
                        },
                      });
                      router.push("/seller/properties");
                    } catch (e: unknown) {
                      setError(getApiErrorMessage(e, "Update failed"));
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

