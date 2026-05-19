import Link from "next/link";
import { notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { fetchVenues } from "../../services/venues";
import { SlotBookingPanel } from "../../components/SlotBookingPanel";
import type { Sport } from "../../context/SearchContext";

const VALID_SPORTS: Sport[] = ["futbol", "tenis", "basquet", "paddle"];

function isValidSport(s: string | undefined): s is Sport {
  return !!s && (VALID_SPORTS as string[]).includes(s);
}

export default async function MerchantPage({
  params,
  searchParams,
}: {
  params: Promise<{ merchantId: string }>;
  searchParams: Promise<{ sport?: string }>;
}) {
  const { merchantId } = await params;
  const { sport } = await searchParams;

  if (!isValidSport(sport)) {
    notFound();
  }

  const allVenues = await fetchVenues({
    sport,
    location: "",
    maxPrice: 0,
    withDeposit: false,
  });

  const venues = allVenues.filter((v) => v.merchant.id === merchantId);
  if (venues.length === 0) {
    notFound();
  }

  const merchant = venues[0].merchant;

  return (
    <main className="flex-1 flex flex-col w-full max-w-md mx-auto px-4 pb-32">
      <header className="py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-brand mb-3 hover:text-brand-dark transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Volver</span>
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-text-light">
          {merchant.name}
        </h1>
        <p className="text-sm text-text-gray">{merchant.address}</p>
        {merchant.description && (
          <p className="text-sm text-text-gray mt-1">{merchant.description}</p>
        )}
      </header>

      <SlotBookingPanel merchantName={merchant.name} venues={venues} />
    </main>
  );
}
