import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { BookingsList } from "../components/BookingsList";

export default async function MisReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string }>;
}) {
  const sp = await searchParams;
  const justConfirmed = sp.confirmed === "1";

  return (
    <main className="flex-1 flex flex-col w-full max-w-md mx-auto px-4 pb-8">
      <header className="py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-brand mb-3 hover:text-brand-dark transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Volver</span>
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-text-light">
          Mis reservas
        </h1>
      </header>

      <BookingsList justConfirmed={justConfirmed} />
    </main>
  );
}
