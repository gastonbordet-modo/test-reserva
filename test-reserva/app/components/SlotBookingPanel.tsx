"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Court } from "../services/slots";
import { createBooking } from "../services/bookings";
import { useSearchContext } from "../context/SearchContext";
import { useSnackbar } from "../context/SnackbarContext";
import { SlotCard } from "./SlotCard";
import { CourtTabs } from "./CourtTabs";
import { ConfirmBookingModal } from "./ConfirmBookingModal";
import { formatPrice } from "../lib/format";

type Props = {
  venueId: string;
  venueName: string;
  courts: Court[];
};

export function SlotBookingPanel({ venueId, venueName, courts }: Props) {
  const router = useRouter();
  const { date } = useSearchContext();
  const { show } = useSnackbar();
  const [activeCourtId, setActiveCourtId] = useState<string>(
    () => courts[0]?.id ?? ""
  );
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (courts.length === 0) {
    return (
      <p className="text-sm text-text-gray mt-4">
        No hay canchas disponibles para este venue.
      </p>
    );
  }

  const activeCourt =
    courts.find((c) => c.id === activeCourtId) ?? courts[0];

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleCourtChange(courtId: string) {
    if (courtId === activeCourtId) return;
    setActiveCourtId(courtId);
    setSelected(new Set());
  }

  const selectedSlots = activeCourt.slots.filter((s) => selected.has(s.id));
  const total = selectedSlots.reduce((sum, s) => sum + s.price, 0);

  async function handleConfirm() {
    if (selected.size === 0 || submitting) return;
    setSubmitting(true);
    try {
      await createBooking({
        venueId,
        courtId: activeCourt.id,
        slotIds: [...selected],
        date,
      });
      router.push("/mis-reservas?confirmed=1");
    } catch (err) {
      setModalOpen(false);
      const message = err instanceof Error ? err.message : "Error al reservar";
      show(message, { variant: "error" });
      setSubmitting(false);
    }
  }

  const showTabs = courts.length > 1;

  return (
    <>
      {showTabs && (
        <CourtTabs
          courts={courts}
          activeCourtId={activeCourt.id}
          onChange={handleCourtChange}
        />
      )}

      <div
        id={`court-panel-${activeCourt.id}`}
        role="tabpanel"
        aria-labelledby={showTabs ? `court-tab-${activeCourt.id}` : undefined}
        className="mt-3 sm:mt-4"
      >
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-text-light truncate">
              {activeCourt.name}
            </h2>
            <p className="text-xs sm:text-sm text-text-gray truncate">
              {activeCourt.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {activeCourt.slots.length === 0 ? (
            <p className="text-sm text-text-gray">
              No hay horarios para esta cancha.
            </p>
          ) : (
            activeCourt.slots.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                selected={selected.has(slot.id)}
                disabled={slot.occupied}
                onToggle={() => toggle(slot.id)}
              />
            ))
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-paper border-t border-gray-20 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            disabled={selected.size === 0}
            className="w-full bg-brand text-paper rounded-modo-button py-3 font-semibold shadow-modo hover:bg-brand-dark disabled:bg-gray-20 disabled:text-text-gray disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {selected.size === 0
              ? "Seleccioná uno o más slots"
              : `Reservar ${selected.size} ${selected.size === 1 ? "slot" : "slots"} · $${formatPrice(total)}`}
          </button>
        </div>
      </div>

      <ConfirmBookingModal
        open={modalOpen}
        onClose={() => {
          if (!submitting) setModalOpen(false);
        }}
        onConfirm={handleConfirm}
        venueName={venueName}
        court={{ name: activeCourt.name, description: activeCourt.description }}
        date={date}
        slots={selectedSlots}
        totalPrice={total}
        submitting={submitting}
      />
    </>
  );
}
