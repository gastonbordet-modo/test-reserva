"use client";

import { useSearchContext } from "../../context/SearchContext";

type Props = {
  onEnter: () => void;
};

export function LocationFilter({ onEnter }: Props) {
  const { location, setLocation } = useSearchContext();

  return (
    <input
      aria-label="Ubicación"
      value={location}
      onChange={(e) => setLocation(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onEnter();
        }
      }}
      type="text"
      placeholder="Palermo, Buenos Aires"
      autoFocus
      className="w-72 border border-gray-20 bg-paper text-text-light placeholder:text-text-gray rounded-modo-button px-4 py-3 focus:outline-none focus:border-brand transition-colors"
    />
  );
}
