import { MOCK_VENUES } from "../data/venues";

export type Slot = {
  id: string;
  startTime: string;
  endTime: string;
  price: number;
  occupied: boolean;
};

export type Court = {
  id: string;
  name: string;
  description: string;
  slots: Slot[];
};

const DAY_START_MINUTES = 8 * 60;
const DAY_END_MINUTES = 22 * 60;
const PEAK_START_MINUTES = 18 * 60;

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function hash(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return h;
}

function isOccupied(
  venueId: string,
  courtId: string,
  index: number,
  startMinutes: number
): boolean {
  const threshold = startMinutes >= PEAK_START_MINUTES ? 60 : 25;
  return hash(`${venueId}-${courtId}-${index}`) % 100 < threshold;
}

export async function fetchSlots(venueId: string): Promise<Court[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const venue = MOCK_VENUES.find((v) => v.id === venueId);
  if (!venue) return [];

  return venue.courts.map((court) => {
    const slots: Slot[] = [];
    let i = 0;
    for (
      let m = DAY_START_MINUTES;
      m + court.slotDurationMinutes <= DAY_END_MINUTES;
      m += court.slotDurationMinutes, i++
    ) {
      slots.push({
        id: `${court.id}-${i}`,
        startTime: formatTime(m),
        endTime: formatTime(m + court.slotDurationMinutes),
        price: court.pricePerSlot,
        occupied: isOccupied(venueId, court.id, i, m),
      });
    }

    return {
      id: court.id,
      name: court.name,
      description: court.description,
      slots,
    };
  });
}
