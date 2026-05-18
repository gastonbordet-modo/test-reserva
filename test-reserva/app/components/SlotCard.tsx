"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCheck } from "@fortawesome/free-solid-svg-icons";
import type { Slot } from "../services/slots";
import { formatPrice } from "../lib/format";

type Props = {
  slot: Slot;
  selected: boolean;
  onToggle: () => void;
};

export function SlotCard({ slot, selected, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={`cursor-pointer flex items-center gap-3 w-full p-4 rounded-modo-md border transition-colors ${
        selected
          ? "bg-brand border-brand text-paper hover:bg-brand-dark"
          : "bg-paper border-gray-20 text-text-light hover:border-brand"
      }`}
    >
      <FontAwesomeIcon
        icon={selected ? faCheck : faClock}
        className={selected ? "text-paper" : "text-gray-60"}
      />
      <span className="font-medium">
        {slot.startTime} - {slot.endTime}
      </span>
      <span
        className={`ml-auto font-semibold ${selected ? "text-paper" : "text-brand"}`}
      >
        ${formatPrice(slot.price)}
      </span>
    </button>
  );
}
