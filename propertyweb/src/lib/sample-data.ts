export type PropertyPurpose = "buy" | "sell" | "rent";
export type FurnishingStatus = "furnished" | "semi-furnished" | "unfurnished";
export type PossessionStatus = "ready" | "under-construction";

export type PropertyType = {
  id: string;
  name: string;
  slug: string;
};

export type Locality = {
  id: string;
  city: string;
  name: string;
  slug: string;
  blurb: string;
  isFeatured?: boolean;
};

export type Property = {
  id: string;
  title: string;
  slug: string;
  purpose: PropertyPurpose;
  propertyType: PropertyType;
  locality: Locality;
  addressLine: string;
  price: number; // buy: total price, rent: monthly
  securityDeposit?: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
  furnishingStatus?: FurnishingStatus;
  possessionStatus?: PossessionStatus;
  isFeatured?: boolean;
  isVerified?: boolean;
  images: { url: string; alt: string }[];
};

// Intentionally empty — all demo/sample data removed.
export const propertyTypes: PropertyType[] = [];
export const localities: Locality[] = [];
export const properties: Property[] = [];
export const testimonials: { name: string; designation: string; comment: string }[] = [];

