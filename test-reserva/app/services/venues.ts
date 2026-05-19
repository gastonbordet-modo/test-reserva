import type { Sport } from "../context/SearchContext";
import { MOCK_VENUES, minCourtPrice, type MockVenue } from "../data/venues";

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
  maxPrice: number;
  withDeposit: boolean;
  date: string;
};

function toPublicVenue(v: MockVenue): Venue {
  return {
    id: v.id,
    name: v.name,
    address: v.address,
    price: minCourtPrice(v),
    imageUrl: v.imageUrl,
  };
}

export async function fetchVenues(
  params: FetchVenuesParams
): Promise<Venue[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const locationQuery = params.location.trim().toLowerCase();

  return MOCK_VENUES.filter((v) => v.sport === params.sport)
    .filter((v) => minCourtPrice(v) <= params.maxPrice)
    .filter((v) =>
      locationQuery ? v.address.toLowerCase().includes(locationQuery) : true
    )
    .filter((v) => (params.withDeposit ? v.hasDeposit : true))
    .map(toPublicVenue)
    .sort((a, b) => a.price - b.price);
}

export async function getVenueById(id: string): Promise<Venue | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const v = MOCK_VENUES.find((mv) => mv.id === id);
  return v ? toPublicVenue(v) : null;
}
