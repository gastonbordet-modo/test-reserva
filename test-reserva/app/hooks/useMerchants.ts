"use client";

import { useEffect, useState } from "react";
import { useSearchContext } from "../context/SearchContext";
import { fetchMerchants, type Merchant } from "../services/merchants";

export function useMerchants(): { merchants: Merchant[]; loading: boolean } {
  const { sport, location, maxPrice, withDeposit } = useSearchContext();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("Fetching merchants with filters:", { sport, location, maxPrice, withDeposit });
    if (!sport) {
      setMerchants([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchMerchants({ sport, withDeposit })
      .then((all) => {
        console.log("Fetched merchants:", all);
        if (cancelled) return;
        
        const locationQ = location.trim().toLowerCase();
        const filtered = all.filter((m) => {
          if (maxPrice > 0 && m.minPrice > maxPrice) return false;
          if (locationQ && !m.address.toLowerCase().includes(locationQ)) {
            return false;
          }
          return true;
        });
        setMerchants(filtered);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setMerchants([]);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sport, location, maxPrice, withDeposit]);

  return { merchants, loading };
}
