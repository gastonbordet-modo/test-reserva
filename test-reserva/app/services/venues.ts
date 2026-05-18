import type { Sport } from "../context/SearchContext";
import { MOCK_VENUES, type MockVenue } from "../data/venues";

export type Venue = {
  id: string;
  name: string;
  address: string;
  price: number;
  imageUrl: string;
};

export type FetchVenuesParams = {
  sport: Sport;
  location: string;
  people: number;
  maxPrice: number;
  withDeposit: boolean;
};

function toPublicVenue(v: MockVenue): Venue {
  const {
    sport: _sport,
    hasDeposit: _hasDeposit,
    slotDurationMinutes: _slotDurationMinutes,
    ...venue
  } = v;
  return venue;
}

export async function fetchVenues(
  params: FetchVenuesParams
): Promise<Venue[]> {
  // simulated network latency
  await new Promise((resolve) => setTimeout(resolve, 300));

  const locationQuery = params.location.trim().toLowerCase();

  return MOCK_VENUES.filter((v) => v.sport === params.sport)
    .filter((v) => v.price <= params.maxPrice)
    .filter((v) =>
      locationQuery ? v.address.toLowerCase().includes(locationQuery) : true
    )
    .filter((v) => (params.withDeposit ? v.hasDeposit : true))
    .sort((a, b) => a.price - b.price)
    .map(toPublicVenue);
}

export async function getVenueById(id: string): Promise<Venue | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const v = MOCK_VENUES.find((mv) => mv.id === id);
  return v ? toPublicVenue(v) : null;
}
