import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck } from "@fortawesome/free-solid-svg-icons";
import { SearchExperience } from "./components/SearchExperience";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="flex justify-end px-6 pt-4">
        <Link
          href="/mis-reservas"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-dark transition-colors"
        >
          <FontAwesomeIcon icon={faCalendarCheck} />
          <span>Mis reservas</span>
        </Link>
      </header>
      <SearchExperience />
    </main>
  );
}
