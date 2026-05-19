import {
  addBooking,
  getAllBookings,
  updateBookingStatus,
  type Booking,
  type BookingSlot,
} from "../data/bookings";
import { apiFetch } from "../lib/api";
import { getUserId } from "../lib/auth";

export type { Booking, BookingSlot, BookingStatus } from "../data/bookings";

// ─────────────────────────────────────────────────────────────────────────────
// Real backend (Supabase Edge Functions)
// ─────────────────────────────────────────────────────────────────────────────

export type ReservationModality =
  | "with_deposit"
  | "without_deposit_manual"
  | "without_deposit_auto";

export type ReservationStatus = "prereserved" | "confirmed";

export type Reservation = {
  id: string;
  slot_id: string;
  user_id: string;
  modality: ReservationModality;
  status: ReservationStatus;
  total_amount: number;
  deposit_amount: number;
  balance_amount: number;
  deposit_status: "not_required" | "pending" | "paid" | "refunded";
  balance_status: "pending" | "paid";
};

export type CreateReservationsParams = {
  slotIds: string[];
};

export async function createReservations(
  params: CreateReservationsParams
): Promise<Reservation[]> {
  const userId = getUserId();
  const data = await apiFetch<{ reservations: Reservation[] }>(
    "/create-reservations-bulk",
    {
      method: "POST",
      userId,
      body: { slot_ids: params.slotIds },
    }
  );
  return data.reservations;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper transicional: mientras `list-user-reservations` siga mockeado, las
// reservas que el user crea se cachean también en el store mock para que
// aparezcan en /mis-reservas sin recargar nada del backend. Se borra cuando
// `fetchUserBookings` consuma el endpoint real.
// ─────────────────────────────────────────────────────────────────────────────

export type ReservationSnapshot = {
  merchantName: string;
  venueId: string;
  venueName: string;
  venueAddress: string;
  venueImageUrl: string;
  venueDescription: string;
  date: string;
  slots: BookingSlot[];
};

export function recordReservationsAsMockBooking(
  reservations: Reservation[],
  snapshot: ReservationSnapshot
): Booking | null {
  if (reservations.length === 0) return null;
  const totalPrice = snapshot.slots.reduce((sum, s) => sum + s.price, 0);
  const booking: Booking = {
    id: reservations[0].id,
    venue: {
      id: snapshot.venueId,
      name: snapshot.merchantName,
      address: snapshot.venueAddress,
      imageUrl: snapshot.venueImageUrl,
    },
    court: {
      id: snapshot.venueId,
      name: snapshot.venueName,
      description: snapshot.venueDescription,
    },
    slots: snapshot.slots,
    date: snapshot.date,
    totalPrice,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  addBooking(booking);
  return booking;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mocks pendientes de migración (esperando contratos de backend):
// - list-user-reservations
// - cancel-user-reservation
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchUserBookings(): Promise<Booking[]> {
  getUserId();
  await new Promise((resolve) => setTimeout(resolve, 250));
  return [...getAllBookings()].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function cancelBooking(bookingId: string): Promise<Booking> {
  getUserId();
  await new Promise((resolve) => setTimeout(resolve, 300));
  const updated = updateBookingStatus(bookingId, "cancelled");
  if (!updated) throw new Error("Reserva no encontrada");
  return updated;
}
