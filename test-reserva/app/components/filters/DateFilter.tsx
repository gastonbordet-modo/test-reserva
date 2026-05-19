"use client";

import { useSearchContext } from "../../context/SearchContext";
import { todayIso } from "../../lib/format";

type Props = {
  onEnter: () => void;
};

export function DateFilter({ onEnter }: Props) {
  const { date, setDate } = useSearchContext();
  const min = todayIso();

  return (
    <input
      aria-label="Fecha"
      value={date}
      min={min}
      onChange={(e) => setDate(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onEnter();
        }
      }}
      type="date"
      autoFocus
      className="w-72 border border-gray-20 bg-paper text-text-light placeholder:text-text-gray rounded-modo-button px-4 py-3 focus:outline-none focus:border-brand transition-colors"
    />
  );
}
