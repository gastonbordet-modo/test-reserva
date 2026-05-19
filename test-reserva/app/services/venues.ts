import type { Sport } from "../context/SearchContext";
import { ApiError, apiFetch } from "../lib/api";

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
};

export async function fetchVenues(
  params: FetchVenuesParams
): Promise<Venue[]> {
  return apiFetch<Venue[]>("/list-venues", {
    query: {
      sport: params.sport,
      location: params.location.trim() || undefined,
      maxPrice: params.maxPrice,
      // Semántica FE: false = no filtra. Solo mandamos el param cuando está activo.
      withDeposit: params.withDeposit ? true : undefined,
    },
  });
}

export async function getVenueById(id: string): Promise<Venue | null> {
  try {
    return await apiFetch<Venue>("/get-venue", { query: { id } });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
