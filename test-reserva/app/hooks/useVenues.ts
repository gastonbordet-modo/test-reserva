"use client";

import { useEffect, useState } from "react";
import { useSearchContext } from "../context/SearchContext";
import { fetchVenues, type Venue } from "../services/venues";

export function useVenues(): { venues: Venue[]; loading: boolean } {
  const { sport, location, maxPrice, withDeposit } = useSearchContext();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sport) {
      setVenues([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchVenues({ sport, location, maxPrice, withDeposit })
      .then((data) => {
        if (cancelled) return;
        setVenues(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setVenues([]);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sport, location, maxPrice, withDeposit]);

  return { venues, loading };
}
