"use client";

import type { Court } from "../services/slots";

type Props = {
  courts: Court[];
  activeCourtId: string;
  onChange: (courtId: string) => void;
};

export function CourtTabs({ courts, activeCourtId, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Canchas"
      className="flex overflow-x-auto -mx-4 px-4 gap-1 border-b border-gray-20 scrollbar-none"
    >
      {courts.map((court) => {
        const active = court.id === activeCourtId;
        return (
          <button
            key={court.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`court-panel-${court.id}`}
            id={`court-tab-${court.id}`}
            onClick={() => onChange(court.id)}
            className={`flex-shrink-0 cursor-pointer px-4 py-2.5 -mb-px text-sm font-medium rounded-t-modo-md border transition-colors ${
              active
                ? "bg-paper border-gray-20 border-b-paper text-brand"
                : "bg-transparent border-transparent text-text-gray hover:text-brand"
            }`}
          >
            {court.name}
          </button>
        );
      })}
    </div>
  );
}
