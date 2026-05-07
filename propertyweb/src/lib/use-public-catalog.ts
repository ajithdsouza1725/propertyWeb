"use client";

import { useEffect, useState } from "react";
import {
  fetchPublicLocalities,
  fetchPublicPropertyTypes,
  type PublicLocality,
  type PublicPropertyType,
} from "@/lib/catalog";
import { SAMPLE_LOCALITIES } from "@/lib/sample-data";

const FALLBACK_LOCALITIES: PublicLocality[] = SAMPLE_LOCALITIES.map((l) => ({
  ...l,
  city: "Mangalore",
}));

const FALLBACK_TYPES: PublicPropertyType[] = [
  { id: 1, name: "Apartment",        slug: "apartment" },
  { id: 2, name: "Villa",            slug: "villa" },
  { id: 3, name: "Independent House",slug: "independent-house" },
  { id: 4, name: "Plot",             slug: "plot" },
  { id: 5, name: "Commercial",       slug: "commercial" },
  { id: 6, name: "PG / Hostel",      slug: "pg-hostel" },
];

export function usePublicCatalog() {
  const [localities, setLocalities] = useState<PublicLocality[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PublicPropertyType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.allSettled([fetchPublicLocalities(), fetchPublicPropertyTypes()]).then((r) => {
      if (!mounted) return;
      const loc = r[0].status === "fulfilled" && r[0].value.length ? r[0].value : FALLBACK_LOCALITIES;
      const types = r[1].status === "fulfilled" && r[1].value.length ? r[1].value : FALLBACK_TYPES;
      setLocalities(loc);
      setPropertyTypes(types);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { localities, propertyTypes, loading };
}

