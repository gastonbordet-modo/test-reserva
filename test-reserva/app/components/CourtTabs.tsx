"use client";

import type { Venue } from "../services/venues";

type Props = {
  venues: Venue[];
  activeVenueId: string;
  onChange: (venueId: string) => void;
};

export function CourtTabs({ venues, activeVenueId, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Canchas"
      className="flex overflow-x-auto -mx-4 px-4 gap-1 border-b border-gray-20 scrollbar-none"
    >
      {venues.map((venue) => {
        const active = venue.id === activeVenueId;
        return (
          <button
            key={venue.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`venue-panel-${venue.id}`}
            id={`venue-tab-${venue.id}`}
            onClick={() => onChange(venue.id)}
            className={`flex-shrink-0 cursor-pointer px-4 py-2.5 -mb-px text-sm font-medium rounded-t-modo-md border transition-colors ${
              active
                ? "bg-paper border-gray-20 border-b-paper text-brand"
                : "bg-transparent border-transparent text-text-gray hover:text-brand"
            }`}
          >
            {venue.name}
          </button>
        );
      })}
    </div>
  );
}
