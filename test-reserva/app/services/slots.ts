import type { Sport } from "../context/SearchContext";
import { apiFetch } from "../lib/api";

export type SlotStatus = "available" | "blocked" | "reserved";

export type SlotVenue = {
  id: string;
  name: string;
  sport: Sport;
  capacity: number;
  basePrice: number;
  imageUrl: string;
  isCovered: boolean;
  address: string;
};

export type Slot = {
  id: string;
  startTime: string; // "HH:MM" hora AR
  endTime: string;
  price: number;
  status: SlotStatus;
  startsAtIso: string;
  endsAtIso: string;
  durationMinutes: number;
  venue: SlotVenue;
};

export async function fetchSlots(
  venueId: string,
  date?: string
): Promise<Slot[]> {
  return apiFetch<Slot[]>("/list-slots", {
    query: {
      venueId,
      date: date || undefined,
    },
  });
}
