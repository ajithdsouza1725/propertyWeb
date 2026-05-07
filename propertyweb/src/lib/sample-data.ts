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
  price: number;
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

export const propertyTypes: PropertyType[] = [];
export const localities: Locality[] = [];
export const properties: Property[] = [];
export const testimonials: { name: string; designation: string; comment: string }[] = [];

/* ── Sample data (shown when backend is offline) ──── */

export type SamplePropertySummary = {
  id: number;
  title: string;
  slug: string;
  purpose: string;
  propertyType: string;
  propertyTypeSlug: string;
  locality: string | null;
  localitySlug: string | null;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqft: number | null;
  isFeatured: boolean;
  isVerified: boolean;
  localityFeatured?: boolean;
  thumbUrl?: string | null;
};

export const SAMPLE_LISTINGS: SamplePropertySummary[] = [
  // ── Buy — Apartments ──
  { id: 1,  title: "Sea View 3 BHK Apartment in Bejai",             slug: "sea-view-3bhk-bejai",             purpose: "buy",  propertyType: "Apartment",  propertyTypeSlug: "apartment",         locality: "Bejai",        localitySlug: "bejai",        price: 8500000,   bedrooms: 3, bathrooms: 2, areaSqft: 1650, isFeatured: true,  isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=450&fit=crop" },
  { id: 2,  title: "Luxury 4 BHK Flat Near Kadri Park",             slug: "luxury-4bhk-kadri",               purpose: "buy",  propertyType: "Apartment",  propertyTypeSlug: "apartment",         locality: "Kadri",        localitySlug: "kadri",        price: 14500000,  bedrooms: 4, bathrooms: 3, areaSqft: 2200, isFeatured: true,  isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=450&fit=crop" },
  { id: 3,  title: "Affordable 2 BHK in Urwa Market Area",          slug: "affordable-2bhk-urwa",            purpose: "buy",  propertyType: "Apartment",  propertyTypeSlug: "apartment",         locality: "Urwa",         localitySlug: "urwa",         price: 4500000,   bedrooms: 2, bathrooms: 1, areaSqft: 950,  isFeatured: false, isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=450&fit=crop" },
  { id: 4,  title: "New 3 BHK Apartment in Hampankatta",            slug: "new-3bhk-hampankatta",            purpose: "buy",  propertyType: "Apartment",  propertyTypeSlug: "apartment",         locality: "Hampankatta",  localitySlug: "hampankatta",  price: 7200000,   bedrooms: 3, bathrooms: 2, areaSqft: 1400, isFeatured: false, isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=450&fit=crop" },

  // ── Buy — Villas & Houses ──
  { id: 5,  title: "Premium Villa with Garden in Kadri",             slug: "premium-villa-kadri",             purpose: "buy",  propertyType: "Villa",      propertyTypeSlug: "villa",             locality: "Kadri",        localitySlug: "kadri",        price: 25000000,  bedrooms: 4, bathrooms: 3, areaSqft: 3200, isFeatured: true,  isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=450&fit=crop" },
  { id: 6,  title: "Independent House in Kottara",                   slug: "independent-house-kottara",       purpose: "buy",  propertyType: "House",      propertyTypeSlug: "independent-house", locality: "Kottara",      localitySlug: "kottara",      price: 12000000,  bedrooms: 3, bathrooms: 2, areaSqft: 1800, isFeatured: false, isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=450&fit=crop" },
  { id: 7,  title: "Duplex House with Terrace in Bejai",             slug: "duplex-bejai",                    purpose: "buy",  propertyType: "House",      propertyTypeSlug: "independent-house", locality: "Bejai",        localitySlug: "bejai",        price: 18000000,  bedrooms: 4, bathrooms: 3, areaSqft: 2600, isFeatured: false, isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=450&fit=crop" },

  // ── Buy — Plots ──
  { id: 8,  title: "Residential Plot in Surathkal",                  slug: "residential-plot-surathkal",      purpose: "buy",  propertyType: "Plot",       propertyTypeSlug: "plot",              locality: "Surathkal",    localitySlug: "surathkal",    price: 4200000,   bedrooms: null, bathrooms: null, areaSqft: 2400, isFeatured: false, isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=450&fit=crop" },
  { id: 9,  title: "Corner Plot in Derebail",                        slug: "corner-plot-derebail",            purpose: "buy",  propertyType: "Plot",       propertyTypeSlug: "plot",              locality: "Derebail",     localitySlug: "derebail",     price: 5800000,   bedrooms: null, bathrooms: null, areaSqft: 3000, isFeatured: true,  isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=600&h=450&fit=crop" },
  { id: 10, title: "30x40 Plot in Konaje Near NITK",                 slug: "plot-konaje-nitk",                purpose: "buy",  propertyType: "Plot",       propertyTypeSlug: "plot",              locality: "Konaje",       localitySlug: "konaje",       price: 3200000,   bedrooms: null, bathrooms: null, areaSqft: 1200, isFeatured: false, isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=600&h=450&fit=crop" },

  // ── Buy — Commercial ──
  { id: 11, title: "Commercial Shop in Hampankatta",                 slug: "commercial-shop-hampankatta",     purpose: "buy",  propertyType: "Commercial", propertyTypeSlug: "commercial",        locality: "Hampankatta",  localitySlug: "hampankatta",  price: 6500000,   bedrooms: null, bathrooms: 1, areaSqft: 800,  isFeatured: false, isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=450&fit=crop" },
  { id: 12, title: "Office Space in Lalbagh",                        slug: "office-space-lalbagh",            purpose: "buy",  propertyType: "Commercial", propertyTypeSlug: "commercial",        locality: "Lalbagh",      localitySlug: "lalbagh",      price: 9500000,   bedrooms: null, bathrooms: 2, areaSqft: 1500, isFeatured: false, isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=450&fit=crop" },

  // ── Rent ──
  { id: 13, title: "2 BHK Furnished Flat for Rent in Urwa",          slug: "2bhk-furnished-urwa",             purpose: "rent", propertyType: "Apartment",  propertyTypeSlug: "apartment",         locality: "Urwa",         localitySlug: "urwa",         price: 18000,     bedrooms: 2, bathrooms: 2, areaSqft: 1100, isFeatured: false, isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=450&fit=crop" },
  { id: 14, title: "Spacious 3 BHK for Rent Near University",        slug: "3bhk-rent-konaje",                purpose: "rent", propertyType: "Apartment",  propertyTypeSlug: "apartment",         locality: "Konaje",       localitySlug: "konaje",       price: 15000,     bedrooms: 3, bathrooms: 2, areaSqft: 1400, isFeatured: false, isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600&h=450&fit=crop" },
  { id: 15, title: "1 BHK Studio Apartment for Rent in Kadri",       slug: "1bhk-studio-kadri",               purpose: "rent", propertyType: "Apartment",  propertyTypeSlug: "apartment",         locality: "Kadri",        localitySlug: "kadri",        price: 10000,     bedrooms: 1, bathrooms: 1, areaSqft: 550,  isFeatured: false, isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600&h=450&fit=crop" },
  { id: 16, title: "Furnished 2 BHK for Rent in Bejai",              slug: "furnished-2bhk-rent-bejai",       purpose: "rent", propertyType: "Apartment",  propertyTypeSlug: "apartment",         locality: "Bejai",        localitySlug: "bejai",        price: 22000,     bedrooms: 2, bathrooms: 2, areaSqft: 1200, isFeatured: true,  isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=450&fit=crop" },
  { id: 17, title: "3 BHK House for Rent in Kottara",                slug: "3bhk-house-rent-kottara",         purpose: "rent", propertyType: "House",      propertyTypeSlug: "independent-house", locality: "Kottara",      localitySlug: "kottara",      price: 25000,     bedrooms: 3, bathrooms: 2, areaSqft: 1600, isFeatured: false, isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=450&fit=crop" },
  { id: 18, title: "Commercial Space for Rent in Attavar",           slug: "commercial-rent-attavar",         purpose: "rent", propertyType: "Commercial", propertyTypeSlug: "commercial",        locality: "Attavar",      localitySlug: "attavar",      price: 35000,     bedrooms: null, bathrooms: 1, areaSqft: 900,  isFeatured: false, isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&h=450&fit=crop" },

  // ── Sell (listings by sellers) ──
  { id: 19, title: "2 BHK Flat for Sale in Bondel",                  slug: "2bhk-sale-bondel",                purpose: "sell", propertyType: "Apartment",  propertyTypeSlug: "apartment",         locality: "Bondel",       localitySlug: "bondel",       price: 5500000,   bedrooms: 2, bathrooms: 2, areaSqft: 1050, isFeatured: false, isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&h=450&fit=crop" },
  { id: 20, title: "Villa for Sale in Valencia",                      slug: "villa-sale-valencia",             purpose: "sell", propertyType: "Villa",      propertyTypeSlug: "villa",             locality: "Valencia",     localitySlug: "valencia",     price: 22000000,  bedrooms: 4, bathrooms: 4, areaSqft: 3500, isFeatured: true,  isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=450&fit=crop" },
  { id: 21, title: "Plot for Sale in Kulur Industrial Area",          slug: "plot-sale-kulur",                 purpose: "sell", propertyType: "Plot",       propertyTypeSlug: "plot",              locality: "Kulur",        localitySlug: "kulur",        price: 8000000,   bedrooms: null, bathrooms: null, areaSqft: 4800, isFeatured: false, isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=450&fit=crop" },
  { id: 22, title: "3 BHK Flat for Sale in Kankanady",                slug: "3bhk-sale-kankanady",             purpose: "sell", propertyType: "Apartment",  propertyTypeSlug: "apartment",         locality: "Kankanady",    localitySlug: "kankanady",    price: 6800000,   bedrooms: 3, bathrooms: 2, areaSqft: 1350, isFeatured: false, isVerified: true,  thumbUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=450&fit=crop" },
];

export const SAMPLE_LOCALITIES = [
  { id: 1,  name: "Bejai",        slug: "bejai",        isFeatured: true  },
  { id: 2,  name: "Kadri",        slug: "kadri",        isFeatured: true  },
  { id: 3,  name: "Urwa",         slug: "urwa",         isFeatured: true  },
  { id: 4,  name: "Surathkal",    slug: "surathkal",    isFeatured: true  },
  { id: 5,  name: "Kottara",      slug: "kottara",      isFeatured: true  },
  { id: 6,  name: "Hampankatta",  slug: "hampankatta",  isFeatured: true  },
  { id: 7,  name: "Derebail",     slug: "derebail",     isFeatured: false },
  { id: 8,  name: "Bondel",       slug: "bondel",       isFeatured: false },
  { id: 9,  name: "Konaje",       slug: "konaje",       isFeatured: false },
  { id: 10, name: "Lalbagh",      slug: "lalbagh",      isFeatured: false },
  { id: 11, name: "Attavar",      slug: "attavar",      isFeatured: false },
  { id: 12, name: "Valencia",     slug: "valencia",     isFeatured: false },
  { id: 13, name: "Kulur",        slug: "kulur",        isFeatured: false },
  { id: 14, name: "Kankanady",    slug: "kankanady",    isFeatured: false },
];

export type SampleTestimonial = {
  id?: number; name?: string | null; designation?: string | null;
  comment?: string | null; imageUrl?: string | null;
};

export const SAMPLE_TESTIMONIALS: SampleTestimonial[] = [
  { id: 1, name: "Priya Shetty",   designation: "Homeowner, Bejai",        comment: "Found our dream home in Bejai through MangaloreHomes. The verification process gave us complete peace of mind. Highly recommended!" },
  { id: 2, name: "Rahul Hegde",    designation: "Property Investor",       comment: "The zero brokerage model saved me a lot. I dealt directly with the owner and closed the deal in 2 weeks. Great platform." },
  { id: 3, name: "Vikram Shenoy",  designation: "First-time Buyer, Kadri", comment: "As a first-time buyer, the listing verification and direct owner contact made the entire process smooth and trustworthy." },
];
