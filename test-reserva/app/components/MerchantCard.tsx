import Image from "next/image";
import Link from "next/link";
import type { Merchant } from "../services/merchants";
import type { Sport } from "../context/SearchContext";
import { formatPrice } from "../lib/format";

type Props = {
  merchant: Merchant;
  sport: Sport;
};

export function MerchantCard({ merchant, sport }: Props) {
  return (
    <Link
      href={`/merchants/${merchant.id}?sport=${sport}`}
      className="cursor-pointer flex gap-4 p-3 bg-paper border border-gray-20 rounded-modo-md shadow-modo hover:border-brand transition-all active:scale-[0.98] active:bg-brand-05 w-full"
    >
      <Image
        src={merchant.imageUrl}
        alt=""
        width={112}
        height={112}
        className="rounded-modo-sm object-cover flex-shrink-0"
      />
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <h3 className="font-bold text-text-light truncate">{merchant.name}</h3>
        <p className="text-sm text-text-gray truncate">{merchant.address}</p>
        <p className="text-xs text-text-gray truncate">
          {merchant.venuesCount}{" "}
          {merchant.venuesCount === 1 ? "cancha" : "canchas"}
        </p>
        <p className="text-sm text-text-gray mt-auto">
          Reservas desde{" "}
          <span className="text-base font-semibold text-brand">
            ${formatPrice(merchant.minPrice)}
          </span>
        </p>
      </div>
    </Link>
  );
}
