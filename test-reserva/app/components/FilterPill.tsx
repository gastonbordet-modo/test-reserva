"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

type FilterPillProps = {
  icon: IconDefinition;
  label: string;
  active?: boolean;
  showCheckWhenActive?: boolean;
  open?: boolean;
  onClick: () => void;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
};

export function FilterPill({
  icon,
  label,
  active = false,
  showCheckWhenActive = false,
  open = false,
  onClick,
  ariaPressed,
  ariaExpanded,
}: FilterPillProps) {
  const displayIcon = active && showCheckWhenActive ? faCheck : icon;

  const containerClass = active
    ? "bg-brand border-brand text-paper hover:bg-brand-dark"
    : open
      ? "bg-paper border-brand text-brand"
      : "bg-paper border-gray-20 text-text-light hover:border-brand hover:text-brand";

  const iconClass = active
    ? "text-paper"
    : open
      ? "text-brand"
      : "text-gray-60";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      className={`cursor-pointer flex items-center gap-2 rounded-modo-button px-3 py-2 text-sm shadow-modo transition-colors border ${containerClass}`}
    >
      <FontAwesomeIcon icon={displayIcon} className={iconClass} />
      <span className="truncate max-w-40">{label}</span>
    </button>
  );
}
