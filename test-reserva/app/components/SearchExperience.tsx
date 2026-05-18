"use client";

import { useEffect, useRef, useState } from "react";
import {
  faLocationDot,
  faUsers,
  faTag,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import {
  useSearchContext,
  SPORT_LABELS,
  type FilterId,
} from "../context/SearchContext";
import { formatPrice } from "../lib/format";
import { SearchBar } from "./SearchBar";
import { FilterPill } from "./FilterPill";
import { LocationFilter } from "./filters/LocationFilter";
import { PeopleFilter } from "./filters/PeopleFilter";
import { PriceFilter } from "./filters/PriceFilter";
import { VenueList } from "./VenueList";

export function SearchExperience() {
  const {
    sport,
    location,
    people,
    maxPrice,
    withDeposit,
    toggleDeposit,
    appliedFilters,
  } = useSearchContext();

  const [openFilter, setOpenFilter] = useState<FilterId | null>(null);
  const filterSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openFilter) return;
    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node | null;
      if (
        target &&
        filterSectionRef.current &&
        !filterSectionRef.current.contains(target)
      ) {
        setOpenFilter(null);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [openFilter]);

  function toggleFilter(id: FilterId) {
    setOpenFilter((prev) => (prev === id ? null : id));
  }

  function closeFilter() {
    setOpenFilter(null);
  }

  const submitted = sport !== null;

  return (
    <div className="flex flex-1 flex-col items-center w-full px-6">
      <div
        className={`w-full max-w-2xl flex flex-col gap-4 transition-all duration-500 ease-out ${
          submitted ? "mt-10" : "mt-[35vh]"
        }`}
      >
        <h1
          className={`font-bold text-text-home text-center transition-all duration-500 ${
            submitted ? "text-base text-text-gray" : "text-2xl"
          }`}
        >
          Bienvenido a modo reservas
        </h1>

        <SearchBar />

        <div ref={filterSectionRef} className="flex flex-col gap-4">
          <div
            className={`flex flex-wrap gap-2 items-center transition-all duration-500 ease-out ${
              submitted
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
            aria-hidden={!submitted}
          >
            {sport && (
              <span className="flex items-center gap-2 bg-brand-10 text-brand-dark rounded-modo-button px-3 py-2 text-sm font-medium">
                {SPORT_LABELS[sport]}
              </span>
            )}

            <FilterPill
              icon={faLocationDot}
              label={appliedFilters.has("location") ? location : "Ubicación"}
              active={appliedFilters.has("location")}
              showCheckWhenActive
              open={openFilter === "location"}
              onClick={() => toggleFilter("location")}
              ariaExpanded={openFilter === "location"}
            />
            <FilterPill
              icon={faUsers}
              label={
                appliedFilters.has("people")
                  ? `${people} ${people === 1 ? "persona" : "personas"}`
                  : "Personas"
              }
              active={appliedFilters.has("people")}
              showCheckWhenActive
              open={openFilter === "people"}
              onClick={() => toggleFilter("people")}
              ariaExpanded={openFilter === "people"}
            />
            <FilterPill
              icon={faTag}
              label={
                appliedFilters.has("price")
                  ? `$${formatPrice(maxPrice)}`
                  : "Precio máximo"
              }
              active={appliedFilters.has("price")}
              showCheckWhenActive
              open={openFilter === "price"}
              onClick={() => toggleFilter("price")}
              ariaExpanded={openFilter === "price"}
            />
            <FilterPill
              icon={faMoneyBillWave}
              label="Con seña"
              active={withDeposit}
              onClick={toggleDeposit}
              ariaPressed={withDeposit}
            />
          </div>

          {submitted && openFilter && (
            <div
              key={openFilter}
              className="filter-panel-enter w-fit bg-paper border border-gray-20 rounded-modo-md shadow-modo p-3"
            >
              {openFilter === "location" && (
                <LocationFilter onEnter={closeFilter} />
              )}
              {openFilter === "people" && (
                <PeopleFilter onEnter={closeFilter} />
              )}
              {openFilter === "price" && <PriceFilter onEnter={closeFilter} />}
            </div>
          )}
        </div>

        {submitted && <VenueList />}
      </div>
    </div>
  );
}
