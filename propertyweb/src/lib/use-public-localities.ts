"use client";

import { useEffect, useState } from "react";
import { fetchPublicLocalities, type PublicLocality } from "@/lib/catalog";
import { SAMPLE_LOCALITIES } from "@/lib/sample-data";

const FALLBACK_LOCALITIES: PublicLocality[] = SAMPLE_LOCALITIES.map((l) => ({
  ...l,
  city: "Mangalore",
}));

export function usePublicLocalities() {
  const [localities, setLocalities] = useState<PublicLocality[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchPublicLocalities()
      .then((r) => {
        if (!mounted) return;
        setLocalities(r.length ? r : FALLBACK_LOCALITIES);
      })
      .catch(() => {
        if (!mounted) return;
        setLocalities(FALLBACK_LOCALITIES);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { localities, loading };
}

