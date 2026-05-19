import Link from "next/link";
import { notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { getVenueById } from "../../services/venues";
import { fetchSlots } from "../../services/slots";
import { SlotBookingPanel } from "../../components/SlotBookingPanel";

export default async function VenuePage({
  params,
}: {
  params: Promise<{ venueId: string }>;
}) {
  const { venueId } = await params;
  const venue = await getVenueById(venueId);
  if (!venue) {
    notFound();
  }
  const courts = await fetchSlots(venueId);

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
          {venue.name}
        </h1>
        <p className="text-sm text-text-gray">{venue.address}</p>
      </header>

      <SlotBookingPanel courts={courts} />
    </main>
  );
}
