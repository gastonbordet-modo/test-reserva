import type { Sport } from "../context/SearchContext";

export type ParsedFilters = {
  sport: Sport | null;
  date: string | null;
  location: string | null;
  maxPrice: number | null;
};

const EMPTY: ParsedFilters = {
  sport: null,
  date: null,
  location: null,
  maxPrice: null,
};

const VALID_SPORTS: Sport[] = ["futbol", "tenis", "basquet", "paddle"];

function sanitize(raw: unknown): ParsedFilters {
  if (!raw || typeof raw !== "object") return EMPTY;
  const r = raw as Record<string, unknown>;

  const sport =
    typeof r.sport === "string" && (VALID_SPORTS as string[]).includes(r.sport)
      ? (r.sport as Sport)
      : null;

  const date =
    typeof r.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.date)
      ? r.date
      : null;

  const location =
    typeof r.location === "string" && r.location.trim().length > 0
      ? r.location.trim()
      : null;

  const maxPrice =
    typeof r.maxPrice === "number" &&
    Number.isFinite(r.maxPrice) &&
    r.maxPrice > 0
      ? Math.round(r.maxPrice)
      : null;

  return { sport, date, location, maxPrice };
}

export async function parseSearchQuery(
  query: string,
  today: string
): Promise<ParsedFilters> {
  try {
    const res = await fetch("/api/parse-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, today }),
    });
    if (!res.ok) return EMPTY;
    const data = await res.json();
    return sanitize(data);
  } catch {
    return EMPTY;
  }
}
