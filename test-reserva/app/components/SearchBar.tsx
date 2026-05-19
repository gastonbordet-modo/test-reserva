"use client";

import { useState, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useSearchContext, type Sport } from "../context/SearchContext";
import { todayIso } from "../lib/format";
import { parseSearchQuery } from "../services/parseSearch";

function detectSport(text: string): Sport | null {
  const n = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  if (/\bfutbol\b/.test(n)) return "futbol";
  if (/\btenis\b/.test(n)) return "tenis";
  if (/\b(basquet|basket)\b/.test(n)) return "basquet";
  if (/\b(paddle|padel)\b/.test(n)) return "paddle";
  return null;
}

export function SearchBar() {
  const { query, setQuery, setSport, applyParsedFilters } = useSearchContext();
  const [error, setError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    if (parsing) return;

    setError(null);
    setParsing(true);
    try {
      const parsed = await parseSearchQuery(trimmed, todayIso());
      const sport = parsed.sport ?? detectSport(trimmed);
      if (!sport) {
        setSport(null);
        setError(
          "No identificamos el deporte. Probá con fútbol, tenis, básquet o paddle."
        );
        return;
      }
      applyParsedFilters({
        sport,
        date: parsed.date,
        location: parsed.location,
        maxPrice: parsed.maxPrice,
      });
    } finally {
      setParsing(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex gap-2 w-full">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="¿Que quieres reservar?"
          disabled={parsing}
          className="flex-1 border border-gray-20 bg-paper text-text-light placeholder:text-text-gray rounded-modo-button px-4 py-3 shadow-modo focus:outline-none focus:border-brand transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          aria-label="Buscar"
          disabled={parsing}
          className="cursor-pointer aspect-square w-12 flex items-center justify-center bg-brand hover:bg-brand-dark text-paper rounded-modo-button shadow-modo transition-colors disabled:bg-gray-20 disabled:text-text-gray disabled:cursor-not-allowed"
        >
          <FontAwesomeIcon
            icon={parsing ? faSpinner : faMagnifyingGlass}
            className={parsing ? "animate-spin" : ""}
          />
        </button>
      </form>
      {error && (
        <p className="text-sm text-system-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
