"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

type NumberStepperProps = {
  value: number;
  onChange: (updater: (prev: number) => number) => void;
  min?: number;
  step?: number;
  prefix?: string;
  ariaLabel: string;
  decrementAriaLabel: string;
  incrementAriaLabel: string;
  inputWidthClass?: string;
  onEnter?: () => void;
};

export function NumberStepper({
  value,
  onChange,
  min = 0,
  step = 1,
  prefix,
  ariaLabel,
  decrementAriaLabel,
  incrementAriaLabel,
  inputWidthClass = "w-24",
  onEnter,
}: NumberStepperProps) {
  const inputClass = `${inputWidthClass} text-center border border-gray-20 bg-paper text-text-light rounded-modo-button py-3 focus:outline-none focus:border-brand transition-colors ${
    prefix ? "pl-8 pr-4" : "px-4"
  }`;

  return (
    <div className="flex items-center gap-2">
      <StepperButton
        icon={faMinus}
        ariaLabel={decrementAriaLabel}
        onClick={() => onChange((p) => Math.max(min, p - step))}
      />
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          aria-label={ariaLabel}
          onChange={(e) =>
            onChange(() => Math.max(min, Number(e.target.value) || min))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onEnter?.();
            }
          }}
          className={inputClass}
        />
      </div>
      <StepperButton
        icon={faPlus}
        ariaLabel={incrementAriaLabel}
        onClick={() => onChange((p) => p + step)}
      />
    </div>
  );
}

function StepperButton({
  icon,
  ariaLabel,
  onClick,
}: {
  icon: IconDefinition;
  ariaLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="cursor-pointer w-12 h-12 flex items-center justify-center bg-paper border border-gray-20 rounded-modo-button text-text-light hover:border-brand hover:text-brand transition-colors"
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  );
}
