"use client";

import { useState } from "react";
import type { Slot } from "../services/slots";
import { SlotCard } from "./SlotCard";
import { formatPrice } from "../lib/format";

type Props = {
  slots: Slot[];
};

export function SlotBookingPanel({ slots }: Props) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const total = slots
    .filter((s) => selected.has(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  function handleConfirm() {
    if (selected.size === 0) return;
    alert(
      `¡Reservaste ${selected.size} slot${selected.size === 1 ? "" : "s"} por $${formatPrice(total)}!`
    );
    setSelected(new Set());
  }

  return (
    <>
      <div className="flex flex-col gap-2 mt-2">
        {slots.length === 0 ? (
          <p className="text-sm text-text-gray">
            No hay horarios disponibles para este venue.
          </p>
        ) : (
          slots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              selected={selected.has(slot.id)}
              onToggle={() => toggle(slot.id)}
            />
          ))
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-paper border-t border-gray-20 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selected.size === 0}
            className="w-full bg-brand text-paper rounded-modo-button py-3 font-semibold shadow-modo hover:bg-brand-dark disabled:bg-gray-20 disabled:text-text-gray disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {selected.size === 0
              ? "Seleccioná uno o más slots"
              : `Reservar ${selected.size} ${selected.size === 1 ? "slot" : "slots"} · $${formatPrice(total)}`}
          </button>
        </div>
      </div>
    </>
  );
}
