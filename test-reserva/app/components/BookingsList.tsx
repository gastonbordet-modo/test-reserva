"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  cancelBooking,
  fetchUserBookings,
  type Booking,
} from "../services/bookings";
import { useSnackbar } from "../context/SnackbarContext";
import { todayIso } from "../lib/format";
import { BookingCard } from "./BookingCard";
import { ConfirmBookingModal } from "./ConfirmBookingModal";

type TabId = "upcoming" | "past";

type Props = {
  justConfirmed: boolean;
};

export function BookingsList({ justConfirmed }: Props) {
  const router = useRouter();
  const { show } = useSnackbar();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("upcoming");
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!justConfirmed) return;
    show("¡Reserva confirmada!", { variant: "success" });
    router.replace("/mis-reservas");
  }, [justConfirmed, show, router]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchUserBookings()
      .then((data) => {
        if (cancelled) return;
        setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoading(false);
        show(
          err instanceof Error ? err.message : "Error al cargar reservas",
          { variant: "error" }
        );
      });
    return () => {
      cancelled = true;
    };
  }, [show]);

  const { upcoming, past } = useMemo(() => {
    const today = todayIso();
    const upcomingList: Booking[] = [];
    const pastList: Booking[] = [];
    for (const b of bookings) {
      if (b.status === "confirmed" && b.date >= today) {
        upcomingList.push(b);
      } else {
        pastList.push(b);
      }
    }
    upcomingList.sort((a, b) => (a.date < b.date ? -1 : 1));
    pastList.sort((a, b) => (a.date > b.date ? -1 : 1));
    return { upcoming: upcomingList, past: pastList };
  }, [bookings]);

  const current = activeTab === "upcoming" ? upcoming : past;

  async function handleCancel() {
    if (!cancelTarget || cancelling) return;
    setCancelling(true);
    try {
      const updated = await cancelBooking(cancelTarget.id);
      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b))
      );
      setCancelTarget(null);
      show("Reserva cancelada", { variant: "success" });
    } catch (err) {
      setCancelTarget(null);
      const message =
        err instanceof Error ? err.message : "No se pudo cancelar la reserva";
      show(message, { variant: "error" });
    } finally {
      setCancelling(false);
    }
  }

  return (
    <>
      <div
        role="tablist"
        aria-label="Reservas"
        className="flex overflow-x-auto -mx-4 px-4 gap-1 border-b border-gray-20 scrollbar-none"
      >
        {(
          [
            { id: "upcoming" as const, label: "Próximas" },
            { id: "past" as const, label: "Pasadas" },
          ]
        ).map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 cursor-pointer px-4 py-2.5 -mb-px text-sm font-medium rounded-t-modo-md border transition-colors ${
                active
                  ? "bg-paper border-gray-20 border-b-paper text-brand"
                  : "bg-transparent border-transparent text-text-gray hover:text-brand"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {loading ? (
          <p className="text-sm text-text-gray">Cargando reservas...</p>
        ) : current.length === 0 ? (
          activeTab === "upcoming" ? (
            <div className="flex flex-col items-start gap-2 py-6">
              <p className="text-sm text-text-gray">
                No tenés reservas próximas.
              </p>
              <Link
                href="/"
                className="text-sm font-semibold text-brand hover:text-brand-dark transition-colors"
              >
                Buscar canchas
              </Link>
            </div>
          ) : (
            <p className="text-sm text-text-gray py-6">
              Todavía no tenés reservas pasadas.
            </p>
          )
        ) : (
          current.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              variant={activeTab}
              onCancel={activeTab === "upcoming" ? setCancelTarget : undefined}
            />
          ))
        )}
      </div>

      <ConfirmBookingModal
        open={cancelTarget !== null}
        onClose={() => {
          if (!cancelling) setCancelTarget(null);
        }}
        onConfirm={handleCancel}
        venueName={cancelTarget?.venue.name ?? ""}
        court={{
          name: cancelTarget?.court.name ?? "",
          description: cancelTarget?.court.description ?? "",
        }}
        date={cancelTarget?.date ?? ""}
        slots={cancelTarget?.slots ?? []}
        totalPrice={cancelTarget?.totalPrice ?? 0}
        submitting={cancelling}
        title="Cancelar reserva"
        description="Esta acción no se puede deshacer. El reembolso se procesa por MODO."
        actionLabel="Sí, cancelar"
        submittingLabel="Cancelando..."
        actionVariant="destructive"
        showDepositBadge={false}
      />
    </>
  );
}
