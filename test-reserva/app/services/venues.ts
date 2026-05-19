import type { Sport } from "../context/SearchContext";
import { ApiError, apiFetch } from "../lib/api";

export type VenueMerchant = {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  requiresDeposit: boolean;
};

export type Venue = {
  id: string;
  name: string;
  address: string;
  price: number;
  imageUrl: string;
  sport: Sport;
  capacity: number;
  isCovered: boolean;
  merchant: VenueMerchant;
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
      // 0 = no filtra (mandar 0 al backend filtraría a precio 0).
      maxPrice: params.maxPrice > 0 ? params.maxPrice : undefined,
      // false = no filtra; solo mandamos el param cuando está activo.
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
