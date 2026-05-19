import { MOCK_VENUES } from "../data/venues";
import {
  addBooking,
  getAllBookings,
  updateBookingStatus,
  type Booking,
  type BookingSlot,
} from "../data/bookings";
import { getAuthToken } from "../lib/auth";

export type { Booking, BookingSlot, BookingStatus } from "../data/bookings";

export type CreateBookingParams = {
  venueId: string;
  courtId: string;
  slotIds: string[];
  date: string;
};

const DAY_START_MINUTES = 8 * 60;
const DAY_END_MINUTES = 22 * 60;

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function buildSlotsForCourt(
  courtId: string,
  duration: number,
  price: number
): BookingSlot[] {
  const slots: BookingSlot[] = [];
  let i = 0;
  for (
    let m = DAY_START_MINUTES;
    m + duration <= DAY_END_MINUTES;
    m += duration, i++
  ) {
    slots.push({
      id: `${courtId}-${i}`,
      startTime: formatTime(m),
      endTime: formatTime(m + duration),
      price,
    });
  }
  return slots;
}

export async function createBooking(
  params: CreateBookingParams
): Promise<Booking> {
  // Token opaco; lo mandaríamos como Authorization: Bearer <token> al backend real.
  getAuthToken();

  await new Promise((resolve) => setTimeout(resolve, 300));

  const venue = MOCK_VENUES.find((v) => v.id === params.venueId);
  if (!venue) throw new Error(`Venue ${params.venueId} no encontrado`);

  const court = venue.courts.find((c) => c.id === params.courtId);
  if (!court) throw new Error(`Cancha ${params.courtId} no encontrada`);

  const allSlots = buildSlotsForCourt(
    court.id,
    court.slotDurationMinutes,
    court.pricePerSlot
  );

  const bookedSlots = allSlots.filter((s) => params.slotIds.includes(s.id));
  if (bookedSlots.length !== params.slotIds.length) {
    throw new Error("Algunos slots no existen para esta cancha");
  }

  const booking: Booking = {
    id: `bk-${crypto.randomUUID()}`,
    venue: {
      id: venue.id,
      name: venue.name,
      address: venue.address,
      imageUrl: venue.imageUrl,
    },
    court: {
      id: court.id,
      name: court.name,
      description: court.description,
    },
    slots: bookedSlots,
    date: params.date,
    totalPrice: bookedSlots.reduce((sum, s) => sum + s.price, 0),
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  addBooking(booking);
  return booking;
}

export async function fetchUserBookings(): Promise<Booking[]> {
  getAuthToken();

  await new Promise((resolve) => setTimeout(resolve, 250));

  return [...getAllBookings()].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function cancelBooking(bookingId: string): Promise<Booking> {
  getAuthToken();

  await new Promise((resolve) => setTimeout(resolve, 300));

  const updated = updateBookingStatus(bookingId, "cancelled");
  if (!updated) throw new Error("Reserva no encontrada");
  return updated;
}
