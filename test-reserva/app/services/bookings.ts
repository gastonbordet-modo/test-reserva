import {
  getAllBookings,
  updateBookingStatus,
  type Booking,
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
