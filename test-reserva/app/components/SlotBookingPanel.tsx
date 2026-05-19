"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Venue } from "../services/venues";
import { fetchSlots, type Slot } from "../services/slots";
import { createReservations } from "../services/bookings";
import { useSearchContext } from "../context/SearchContext";
import { useSnackbar } from "../context/SnackbarContext";
import { ApiError } from "../lib/api";
import { SlotCard } from "./SlotCard";
import { CourtTabs } from "./CourtTabs";
import { ConfirmBookingModal } from "./ConfirmBookingModal";
import { formatPrice } from "../lib/format";

type Props = {
  merchantName: string;
  venues: Venue[];
};

type SlotsState = {
  byVenueId: Record<string, Slot[]>;
  loading: boolean;
};

export function SlotBookingPanel({ merchantName, venues }: Props) {
  const router = useRouter();
  const { date } = useSearchContext();
  const { show } = useSnackbar();
  const [activeVenueId, setActiveVenueId] = useState<string>(
    () => venues[0]?.id ?? ""
  );
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slotsState, setSlotsState] = useState<SlotsState>({
    byVenueId: {},
    loading: true,
  });
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    if (venues.length === 0) {
      setSlotsState({ byVenueId: {}, loading: false });
      return;
    }
    let cancelled = false;
    setSlotsState((prev) => ({ ...prev, loading: true }));
    Promise.all(
      venues.map((v) =>
        fetchSlots(v.id, date || undefined).catch(() => [] as Slot[])
      )
    ).then((results) => {
      if (cancelled) return;
      const byVenueId: Record<string, Slot[]> = {};
      venues.forEach((v, i) => {
        byVenueId[v.id] = results[i];
      });
      setSlotsState({ byVenueId, loading: false });
      setSelected(new Set());
    });
    return () => {
      cancelled = true;
    };
  }, [venues, date, reloadTick]);

  if (venues.length === 0) {
    return (
      <p className="text-sm text-text-gray mt-4">
        No hay canchas disponibles para este complejo.
      </p>
    );
  }

  const activeVenue =
    venues.find((v) => v.id === activeVenueId) ?? venues[0];
  const activeSlots = slotsState.byVenueId[activeVenue.id] ?? [];

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleVenueChange(venueId: string) {
    if (venueId === activeVenueId) return;
    setActiveVenueId(venueId);
    setSelected(new Set());
  }

  const selectedSlots = activeSlots.filter((s) => selected.has(s.id));
  const total = selectedSlots.reduce((sum, s) => sum + s.price, 0);

  async function handleConfirm() {
    if (selected.size === 0 || submitting) return;
    setSubmitting(true);
    try {
      await createReservations({ slotIds: [...selected] });
      router.push("/mis-reservas?confirmed=1");
    } catch (err) {
      setModalOpen(false);
      setSelected(new Set());
      const isStale =
        err instanceof ApiError &&
        (err.code === "slot_not_available" ||
          err.code === "slot_already_reserved");
      const message = isStale
        ? "Ese turno ya no está disponible"
        : err instanceof Error
          ? err.message
          : "Error al reservar";
      show(message, { variant: "error" });
      setSubmitting(false);
      if (isStale) setReloadTick((t) => t + 1);
    }
  }

  const showTabs = venues.length > 1;

  return (
    <>
      {showTabs && (
        <CourtTabs
          venues={venues}
          activeVenueId={activeVenue.id}
          onChange={handleVenueChange}
        />
      )}

      <div
        id={`venue-panel-${activeVenue.id}`}
        role="tabpanel"
        aria-labelledby={showTabs ? `venue-tab-${activeVenue.id}` : undefined}
        className="mt-3 sm:mt-4"
      >
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-text-light truncate">
              {activeVenue.name}
            </h2>
            <p className="text-xs sm:text-sm text-text-gray truncate">
              {activeVenue.isCovered ? "Techada" : "Al aire libre"} ·{" "}
              {activeVenue.capacity} jugadores
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {slotsState.loading ? (
            <p className="text-sm text-text-gray">Cargando horarios...</p>
          ) : activeSlots.length === 0 ? (
            <p className="text-sm text-text-gray">
              No hay horarios para esta cancha.
            </p>
          ) : (
            activeSlots.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                selected={selected.has(slot.id)}
                disabled={slot.status !== "available"}
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
        venueName={merchantName}
        court={{
          name: activeVenue.name,
          description: `${activeVenue.isCovered ? "Techada" : "Al aire libre"} · ${activeVenue.capacity} jugadores`,
        }}
        date={date}
        slots={selectedSlots}
        totalPrice={total}
        submitting={submitting}
      />
    </>
  );
}
