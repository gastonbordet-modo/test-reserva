"use client";

import { useMerchants } from "../hooks/useMerchants";
import { useSearchContext } from "../context/SearchContext";
import { MerchantCard } from "./MerchantCard";

export function MerchantList() {
  const { sport } = useSearchContext();
  const { merchants, loading } = useMerchants();

  if (!sport) return null;

  if (loading && merchants.length === 0) {
    return <p className="text-sm text-text-gray">Buscando...</p>;
  }

  if (merchants.length === 0) {
    return (
      <p className="text-sm text-text-gray">
        No encontramos complejos con esos filtros.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {merchants.map((merchant) => (
        <MerchantCard key={merchant.id} merchant={merchant} sport={sport} />
      ))}
    </div>
  );
}
