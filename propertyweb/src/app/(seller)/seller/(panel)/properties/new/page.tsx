"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SellerPropertyImagesField } from "@/components/seller/seller-property-images-field";
import { apiFetch, getApiErrorMessage } from "@/lib/api";

import { usePublicCatalog } from "@/lib/use-public-catalog";
import { useAccessToken } from "@/lib/use-access-token";

export default function SellerAddPropertyPage() {
  const router = useRouter();
  const { localities, propertyTypes, loading: catalogLoading } = usePublicCatalog();

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

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const token = useAccessToken();

  const allowedTypes =
    purpose === "rent"
      ? propertyTypes.filter((t) => ["residential", "commercial"].includes(String(t.slug)))
      : propertyTypes;
  const ptSlug = propertyTypeSlug || allowedTypes[0]?.slug || "";
  const locSlug = localitySlug || localities[0]?.slug || "";

  const typeSlug = String(ptSlug ?? "").toLowerCase();

  const validation = useMemo(() => {
    const errs: string[] = [];
    if (!token) errs.push("Please login to submit.");
    if (!title.trim()) errs.push("Title is required.");
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
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add property</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Post your property. It will go to admin approval (Pending) before it appears publicly.
          </p>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/seller/properties">Back</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-8">
          {catalogLoading ? (
            <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">Loading property types and localities…</div>
          ) : null}
          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">{error}</div>
          ) : null}
          {!error && !validation.ok && validation.errs.length ? (
            <div className="rounded-xl border bg-muted/30 p-4 text-sm">
              <div className="font-medium">Fix these to submit:</div>
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
                  to submit.
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted-foreground">Purpose</div>
                  <Select value={purpose} onValueChange={(v) => setPurpose(v as any)}>
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
                  <Select value={ptSlug} onValueChange={(v) => setPropertyTypeSlug(v)}>
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
                <Input
                  className="h-11"
                  placeholder="e.g. 2 BHK near Kadri Park"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted-foreground">Locality</div>
                  <Select value={locSlug} onValueChange={(v) => setLocalitySlug(v)}>
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
                    placeholder={purpose === "rent" ? "e.g. 25000" : "e.g. 7500000"}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="text-xs font-medium text-muted-foreground">Description (optional)</div>
                <Textarea
                  placeholder="A short description helps get faster approval."
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Separator />

              <div className="grid gap-2">
                <div className="text-sm font-semibold tracking-tight">Optional details</div>
                <div className="text-xs text-muted-foreground">
                  Add these now or later — they’re optional for approval.
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted-foreground">City</div>
                  <Input className="h-11" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted-foreground">Pincode</div>
                  <Input className="h-11" value={pincode} onChange={(e) => setPincode(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="text-xs font-medium text-muted-foreground">Address</div>
                <Input
                  className="h-11"
                  placeholder="Full address"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted-foreground">Security deposit</div>
                  <Input
                    className="h-11"
                    inputMode="numeric"
                    placeholder="Optional"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value)}
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
                    placeholder={["commercial", "land", "agricultural-land"].includes(typeSlug) ? "Required" : "Optional"}
                    value={areaSqft}
                    onChange={(e) => setAreaSqft(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted-foreground">Bedrooms</div>
                  <Input
                    className="h-11"
                    inputMode="numeric"
                    placeholder={typeSlug === "residential" ? "Required" : "Optional"}
                    disabled={typeSlug !== "residential"}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted-foreground">Bathrooms</div>
                  <Input
                    className="h-11"
                    inputMode="numeric"
                    placeholder={typeSlug === "residential" ? "Required" : "Optional"}
                    disabled={typeSlug !== "residential"}
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
                    placeholder="Required"
                    value={parkingCount}
                    onChange={(e) => setParkingCount(e.target.value)}
                  />
                </div>
              ) : null}

              {typeSlug === "land" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <div className="text-xs font-medium text-muted-foreground">Road access</div>
                    <Input
                      className="h-11"
                      placeholder="Required (e.g. 20ft road / corner plot)"
                      value={landRoadAccess}
                      onChange={(e) => setLandRoadAccess(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="text-xs font-medium text-muted-foreground">Survey no.</div>
                    <Input
                      className="h-11"
                      placeholder="Required"
                      value={landSurveyNo}
                      onChange={(e) => setLandSurveyNo(e.target.value)}
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
                      placeholder="Required (e.g. borewell / river / canal)"
                      value={agriWaterSource}
                      onChange={(e) => setAgriWaterSource(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="text-xs font-medium text-muted-foreground">Soil type</div>
                    <Input
                      className="h-11"
                      placeholder="Required (e.g. laterite / clay)"
                      value={agriSoilType}
                      onChange={(e) => setAgriSoilType(e.target.value)}
                    />
                  </div>
                </div>
              ) : null}

              <Separator />

              <SellerPropertyImagesField
                token={token}
                propertyId={null}
                imageUrls={imageUrls}
                onChange={setImageUrls}
                disabled={!token}
              />

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                <Button variant="outline" asChild>
                  <Link href="/seller/properties">Cancel</Link>
                </Button>
                <Button
                  disabled={!validation.ok || submitting || catalogLoading}
                  onClick={async () => {
                    if (!token) return;
                    setSubmitting(true);
                    setError(null);
                    try {
                      const pt = propertyTypes.find((t) => t.slug === ptSlug);
                      const loc = localities.find((l) => l.slug === locSlug);
                      if (!pt) throw new Error("Please choose a property type.");
                      if (!loc) throw new Error("Please choose a locality.");

                      const created = await apiFetch<{ id: number }>("/api/seller/properties", {
                        token,
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
                          furnishingStatus: null,
                          possessionStatus: null,
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
                      if (imageUrls.length && created?.id != null) {
                        await apiFetch(`/api/seller/properties/${created.id}/images`, {
                          token,
                          body: { urls: imageUrls },
                        });
                      }
                      router.push("/seller/properties");
                    } catch (e: unknown) {
                      setError(getApiErrorMessage(e, "Submit failed"));
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {submitting ? "Submitting…" : "Submit for approval"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <Card className="border-muted/60">
              <CardHeader>
                <CardTitle className="text-base">Listing tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <div className="font-medium text-foreground">Title that converts</div>
                  Use BHK + key landmark + locality (e.g. “2 BHK near Kadri Park”).
                </div>
                <div>
                  <div className="font-medium text-foreground">Photos-first</div>
                  Upload bright living room + bedroom + kitchen + building/front.
                </div>
                <div>
                  <div className="font-medium text-foreground">Be specific</div>
                  Mention floor, parking, facing, and any restrictions (family/bachelor).
                </div>
              </CardContent>
            </Card>

            <Card className="border-muted/60">
              <CardHeader>
                <CardTitle className="text-base">Preview (coming)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                We’ll show a live preview of the property card + details page as you fill the form.
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}

