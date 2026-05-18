import Image from "next/image";
import type { Venue } from "../services/venues";
import { formatPrice } from "../lib/format";

type Props = {
  venue: Venue;
};

export function VenueCard({ venue }: Props) {
  return (
    <button
      type="button"
      className="cursor-pointer flex gap-4 p-3 bg-paper border border-gray-20 rounded-modo-md shadow-modo hover:border-brand transition-colors text-left w-full"
    >
      <Image
        src={venue.imageUrl}
        alt=""
        width={112}
        height={112}
        className="rounded-modo-sm object-cover flex-shrink-0"
      />
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <h3 className="font-bold text-text-light truncate">{venue.name}</h3>
        <p className="text-sm text-text-gray truncate">{venue.address}</p>
        <p className="text-base font-semibold text-brand mt-auto">
          ${formatPrice(venue.price)}
        </p>
      </div>
    </button>
  );
}
