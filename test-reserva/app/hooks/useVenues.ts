"use client";

import { useEffect, useState } from "react";
import { useSearchContext } from "../context/SearchContext";
import { fetchVenues, type Venue } from "../services/venues";

export function useVenues(): { venues: Venue[]; loading: boolean } {
  const { sport, location, maxPrice, withDeposit, date } = useSearchContext();
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

    fetchVenues({ sport, location, maxPrice, withDeposit, date }).then(
      (data) => {
        if (cancelled) return;
        setVenues(data);
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [sport, location, maxPrice, withDeposit, date]);

  return { venues, loading };
}
