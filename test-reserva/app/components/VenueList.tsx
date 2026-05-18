"use client";

import { useVenues } from "../hooks/useVenues";
import { VenueCard } from "./VenueCard";

export function VenueList() {
  const { venues, loading } = useVenues();

  if (loading && venues.length === 0) {
    return <p className="text-sm text-text-gray">Buscando...</p>;
  }

  if (venues.length === 0) {
    return (
      <p className="text-sm text-text-gray">
        No encontramos venues con esos filtros.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {venues.map((venue) => (
        <VenueCard key={venue.id} venue={venue} />
      ))}
    </div>
  );
}
