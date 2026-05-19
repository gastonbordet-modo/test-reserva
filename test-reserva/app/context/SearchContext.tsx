"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { todayIso } from "../lib/format";

export type Sport = "futbol" | "tenis" | "basquet" | "paddle";
export type FilterId = "location" | "price" | "date";

export const SPORT_LABELS: Record<Sport, string> = {
  futbol: "Fútbol",
  tenis: "Tenis",
  basquet: "Básquet",
  paddle: "Paddle",
};

type SearchContextValue = {
  query: string;
  setQuery: (v: string) => void;
  sport: Sport | null;
  setSport: (v: Sport | null) => void;
  location: string;
  setLocation: (v: string) => void;
  maxPrice: number;
  setMaxPrice: (updater: (prev: number) => number) => void;
  withDeposit: boolean;
  toggleDeposit: () => void;
  date: string;
  setDate: (v: string) => void;
  appliedFilters: Set<FilterId>;
  applyParsedFilters: (p: {
    sport?: Sport | null;
    date?: string | null;
    location?: string | null;
    maxPrice?: number | null;
  }) => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState<Sport | null>(null);
  const [location, setLocationRaw] = useState("CABA");
  const [maxPrice, setMaxPriceRaw] = useState(5000);
  const [withDeposit, setWithDeposit] = useState(false);
  const [date, setDateRaw] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<Set<FilterId>>(
    () => new Set<FilterId>(["location", "price"])
  );

  useEffect(() => {
    setDateRaw(todayIso());
    setAppliedFilters((prev) => {
      if (prev.has("date")) return prev;
      const next = new Set(prev);
      next.add("date");
      return next;
    });
  }, []);

  function setApplied(id: FilterId, applied: boolean) {
    setAppliedFilters((prev) => {
      if (prev.has(id) === applied) return prev;
      const next = new Set(prev);
      if (applied) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function setLocation(value: string) {
    setLocationRaw(value);
    setApplied("location", value.trim().length > 0);
  }

  function setMaxPrice(updater: (prev: number) => number) {
    setMaxPriceRaw(updater);
    setApplied("price", true);
  }

  function toggleDeposit() {
    setWithDeposit((prev) => !prev);
  }

  function setDate(value: string) {
    setDateRaw(value);
    setApplied("date", value.length > 0);
  }

  function applyParsedFilters(p: {
    sport?: Sport | null;
    date?: string | null;
    location?: string | null;
    maxPrice?: number | null;
  }) {
    if (p.sport !== undefined && p.sport !== null) {
      setSport(p.sport);
    }
    const touchedFilters: FilterId[] = [];
    if (p.date !== undefined && p.date !== null) {
      setDateRaw(p.date);
      touchedFilters.push("date");
    }
    if (p.location !== undefined && p.location !== null) {
      setLocationRaw(p.location);
      touchedFilters.push("location");
    }
    if (p.maxPrice !== undefined && p.maxPrice !== null) {
      setMaxPriceRaw(p.maxPrice);
      touchedFilters.push("price");
    }
    if (touchedFilters.length > 0) {
      setAppliedFilters((prev) => {
        const next = new Set(prev);
        for (const id of touchedFilters) next.add(id);
        return next;
      });
    }
  }

  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        sport,
        setSport,
        location,
        setLocation,
        maxPrice,
        setMaxPrice,
        withDeposit,
        toggleDeposit,
        date,
        setDate,
        appliedFilters,
        applyParsedFilters,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearchContext must be used within SearchProvider");
  }
  return ctx;
}
