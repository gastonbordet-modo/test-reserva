"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Sport = "futbol" | "tenis" | "basquet" | "paddle";
export type FilterId = "location" | "people" | "price";

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
  people: number;
  setPeople: (updater: (prev: number) => number) => void;
  maxPrice: number;
  setMaxPrice: (updater: (prev: number) => number) => void;
  withDeposit: boolean;
  toggleDeposit: () => void;
  appliedFilters: Set<FilterId>;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState<Sport | null>(null);
  const [location, setLocationRaw] = useState("");
  const [people, setPeopleRaw] = useState(2);
  const [maxPrice, setMaxPriceRaw] = useState(5000);
  const [withDeposit, setWithDeposit] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<Set<FilterId>>(
    () => new Set()
  );

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

  function setPeople(updater: (prev: number) => number) {
    setPeopleRaw(updater);
    setApplied("people", true);
  }

  function setMaxPrice(updater: (prev: number) => number) {
    setMaxPriceRaw(updater);
    setApplied("price", true);
  }

  function toggleDeposit() {
    setWithDeposit((prev) => !prev);
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
        people,
        setPeople,
        maxPrice,
        setMaxPrice,
        withDeposit,
        toggleDeposit,
        appliedFilters,
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
