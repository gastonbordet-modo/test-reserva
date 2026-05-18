import { MOCK_VENUES } from "../data/venues";

export type Slot = {
  id: string;
  startTime: string;
  endTime: string;
  price: number;
};

const DAY_START_MINUTES = 8 * 60; // 08:00
const DAY_END_MINUTES = 22 * 60; // 22:00

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export async function fetchSlots(venueId: string): Promise<Slot[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const venue = MOCK_VENUES.find((v) => v.id === venueId);
  if (!venue) return [];

  const slots: Slot[] = [];
  const duration = venue.slotDurationMinutes;

  let i = 0;
  for (
    let m = DAY_START_MINUTES;
    m + duration <= DAY_END_MINUTES;
    m += duration, i++
  ) {
    slots.push({
      id: `${venueId}-${i}`,
      startTime: formatTime(m),
      endTime: formatTime(m + duration),
      price: venue.price,
    });
  }

  return slots;
}
