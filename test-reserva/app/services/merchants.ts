import type { Sport } from "../context/SearchContext";
import { apiFetch } from "../lib/api";

export type Merchant = {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  requiresDeposit: boolean;
  minPrice: number;
  imageUrl: string;
  sports: Sport[];
  venuesCount: number;
};

type BackendMerchant = Omit<Merchant, "imageUrl">;

export type FetchMerchantsParams = {
  sport?: Sport;
  withDeposit?: boolean;
};

function withImageUrl(m: BackendMerchant): Merchant {
  return {
    ...m,
    imageUrl: `https://picsum.photos/seed/${m.slug || m.id}/240/240`,
  };
}

export async function fetchMerchants(
  params: FetchMerchantsParams = {}
): Promise<Merchant[]> {
  console.log("Fetching merchants with params:", params);
  const raw = await apiFetch<BackendMerchant[]>("/list-merchants", {
    query: {
      sport: params.sport,
      // false = no filtra; solo mandamos el param cuando está activo.
      withDeposit: params.withDeposit ? true : undefined,
    },
  });
  return raw.map(withImageUrl);
}
