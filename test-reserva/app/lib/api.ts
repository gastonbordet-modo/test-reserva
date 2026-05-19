export const API_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`
  : "";

export const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export class ApiError extends Error {
  code: string;
  status: number;
  body: unknown;
  constructor(code: string, status: number, body?: unknown) {
    super(code);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.body = body;
  }
}

function snakeCase(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

type QueryValue = string | number | boolean | null | undefined;

export function toSnakeCaseParams(
  params: Record<string, QueryValue>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    out[snakeCase(k)] = String(v);
  }
  return out;
}

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, QueryValue>;
  body?: unknown;
  userId?: string;
  signal?: AbortSignal;
};

export async function apiFetch<T>(
  path: string,
  opts: ApiFetchOptions = {}
): Promise<T> {
  if (!API_BASE || !ANON_KEY) {
    throw new ApiError(
      "missing_supabase_env",
      0,
      "Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  const url = new URL(`${API_BASE}${path}`);
  if (opts.query) {
    const snake = toSnakeCaseParams(opts.query);
    for (const [k, v] of Object.entries(snake)) {
      url.searchParams.set(k, v);
    }
  }

  const headers: Record<string, string> = {
    apikey: ANON_KEY,
  };
  if (opts.userId) headers["X-User-Id"] = opts.userId;
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(url.toString(), {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  if (!res.ok) {
    let parsed: unknown = null;
    let code = `${path.replace(/^\//, "")}_${res.status}`;
    try {
      parsed = await res.json();
      const errCode = (parsed as { error?: { code?: string } })?.error?.code;
      if (errCode) code = errCode;
    } catch {
      // sin body parseable
    }
    throw new ApiError(code, res.status, parsed);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
