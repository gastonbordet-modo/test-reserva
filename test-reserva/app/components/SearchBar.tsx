"use client";

import { useState, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useSearchContext, type Sport } from "../context/SearchContext";

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
  const { query, setQuery, setSport } = useSearchContext();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const detected = detectSport(query);
    if (!detected) {
      setError(
        "No identificamos el deporte. Probá con fútbol, tenis, básquet o paddle."
      );
      setSport(null);
      return;
    }
    setError(null);
    setSport(detected);
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex gap-2 w-full">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="¿Que quieres reservar?"
          className="flex-1 border border-gray-20 bg-paper text-text-light placeholder:text-text-gray rounded-modo-button px-4 py-3 shadow-modo focus:outline-none focus:border-brand transition-colors"
        />
        <button
          type="submit"
          aria-label="Buscar"
          className="cursor-pointer aspect-square w-12 flex items-center justify-center bg-brand hover:bg-brand-dark text-paper rounded-modo-button shadow-modo transition-colors"
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} />
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
