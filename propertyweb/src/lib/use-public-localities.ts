"use client";

import { useEffect, useState } from "react";
import { fetchPublicLocalities, type PublicLocality } from "@/lib/catalog";

export function usePublicLocalities() {
  const [localities, setLocalities] = useState<PublicLocality[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchPublicLocalities()
      .then((r) => {
        if (!mounted) return;
        setLocalities(r);
      })
      .catch(() => {
        if (!mounted) return;
        setLocalities([]);
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

