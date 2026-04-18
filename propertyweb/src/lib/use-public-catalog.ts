"use client";

import { useEffect, useState } from "react";
import {
  fetchPublicLocalities,
  fetchPublicPropertyTypes,
  type PublicLocality,
  type PublicPropertyType,
} from "@/lib/catalog";

export function usePublicCatalog() {
  const [localities, setLocalities] = useState<PublicLocality[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PublicPropertyType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.allSettled([fetchPublicLocalities(), fetchPublicPropertyTypes()]).then((r) => {
      if (!mounted) return;
      const loc = r[0].status === "fulfilled" ? r[0].value : [];
      const types = r[1].status === "fulfilled" ? r[1].value : [];
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

