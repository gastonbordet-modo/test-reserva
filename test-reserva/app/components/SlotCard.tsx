"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCheck, faLock } from "@fortawesome/free-solid-svg-icons";
import type { Slot } from "../services/slots";
import { formatPrice } from "../lib/format";

type Props = {
  slot: Slot;
  selected: boolean;
  disabled?: boolean;
  onToggle: () => void;
};

export function SlotCard({ slot, selected, disabled = false, onToggle }: Props) {
  const containerClass = disabled
    ? "bg-gray-08 border-gray-20 text-text-gray opacity-60 cursor-not-allowed"
    : selected
      ? "bg-brand border-brand text-paper hover:bg-brand-dark cursor-pointer"
      : "bg-paper border-gray-20 text-text-light hover:border-brand cursor-pointer";

  const icon = disabled ? faLock : selected ? faCheck : faClock;
  const iconClass = disabled
    ? "text-text-gray"
    : selected
      ? "text-paper"
      : "text-gray-60";

  const priceClass = disabled
    ? "text-text-gray line-through"
    : selected
      ? "text-paper"
      : "text-brand";

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onToggle}
      aria-pressed={selected}
      aria-disabled={disabled}
      disabled={disabled}
      className={`flex items-center gap-3 w-full p-3 sm:p-4 rounded-modo-md border transition-colors ${containerClass}`}
    >
      <FontAwesomeIcon icon={icon} className={iconClass} />
      <span className="font-medium text-sm sm:text-base">
        {slot.startTime} - {slot.endTime}
      </span>
      <span className={`ml-auto font-semibold text-sm sm:text-base ${priceClass}`}>
        ${formatPrice(slot.price)}
      </span>
    </button>
  );
}
