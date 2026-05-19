"use client";

import { useEffect, useId, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import type { Slot } from "../services/slots";
import { formatPrice, formatDateLabel } from "../lib/format";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  venueName: string;
  court: { name: string; description: string };
  date: string;
  slots: Slot[];
  totalPrice: number;
  submitting: boolean;
};

export function ConfirmBookingModal({
  open,
  onClose,
  onConfirm,
  venueName,
  court,
  date,
  slots,
  totalPrice,
  submitting,
}: Props) {
  const titleId = useId();
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmBtnRef.current?.focus();
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitting) onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, submitting, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="backdrop-enter fixed inset-0 z-40 bg-black-55"
        onClick={() => {
          if (!submitting) onClose();
        }}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="sheet-enter fixed inset-x-0 bottom-0 z-50 bg-paper rounded-t-modo-xl shadow-modo max-w-md mx-auto"
      >
        <div className="flex flex-col max-h-[85vh]">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-20" aria-hidden />
          </div>

          <div className="px-5 pb-2">
            <h2
              id={titleId}
              className="text-lg sm:text-xl font-bold text-text-light"
            >
              Confirmar reserva
            </h2>
          </div>

          <div className="px-5 py-3 flex flex-col gap-4 overflow-y-auto">
            <div>
              <p className="text-xs uppercase tracking-wide text-text-gray font-medium">
                Venue
              </p>
              <p className="text-base font-semibold text-text-light">
                {venueName}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-text-gray font-medium">
                Cancha
              </p>
              <p className="text-base font-semibold text-text-light">
                {court.name}
              </p>
              <p className="text-sm text-text-gray">{court.description}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-text-gray font-medium">
                Fecha
              </p>
              <p className="text-base font-semibold text-text-light">
                {formatDateLabel(date)}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-text-gray font-medium mb-1">
                Horarios ({slots.length})
              </p>
              <ul className="flex flex-col gap-1.5">
                {slots.map((slot) => (
                  <li
                    key={slot.id}
                    className="flex items-center gap-3 text-sm text-text-light"
                  >
                    <FontAwesomeIcon
                      icon={faClock}
                      className="text-gray-60 text-xs"
                    />
                    <span className="font-medium">
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <span className="ml-auto text-text-gray">
                      ${formatPrice(slot.price)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 bg-gray-08 text-text-gray rounded-modo-button px-3 py-1.5 text-xs font-medium">
                Sin seña
              </span>
            </div>

            <div className="flex items-baseline justify-between border-t border-gray-20 pt-3">
              <span className="text-sm text-text-gray font-medium">Total</span>
              <span className="text-xl font-bold text-brand">
                ${formatPrice(totalPrice)}
              </span>
            </div>
          </div>

          <div
            className="px-5 pt-3 pb-4 flex gap-2 border-t border-gray-20"
            style={{
              paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 bg-paper border border-gray-20 text-text-light rounded-modo-button py-3 font-semibold hover:border-brand hover:text-brand disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              ref={confirmBtnRef}
              type="button"
              onClick={onConfirm}
              disabled={submitting}
              className="flex-1 bg-brand text-paper rounded-modo-button py-3 font-semibold shadow-modo hover:bg-brand-dark disabled:bg-gray-20 disabled:text-text-gray disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {submitting ? "Reservando..." : "Confirmar"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
