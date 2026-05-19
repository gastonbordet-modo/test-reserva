import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";

const requestSchema = z.object({
  query: z.string().trim().min(1).max(200),
  today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const filtersSchema = z.object({
  sport: z.enum(["futbol", "tenis", "basquet", "paddle"]).nullable(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  location: z.string().min(1).nullable(),
  maxPrice: z.number().int().positive().nullable(),
});

type ParsedFilters = z.infer<typeof filtersSchema>;

const EMPTY: ParsedFilters = {
  sport: null,
  date: null,
  location: null,
  maxPrice: null,
};

function systemPrompt(today: string): string {
  return [
    `Sos un parser. Hoy es ${today} (zona horaria Argentina).`,
    `Extraés filtros de una búsqueda en español rioplatense para reservar canchas deportivas.`,
    `Devolvés siempre los 4 campos. Usá null en el campo que NO aparezca explícita o implícitamente en el texto. Nunca inventes.`,
    ``,
    `Reglas por campo:`,
    `- sport: uno de "futbol" | "tenis" | "basquet" | "paddle". Mapeá tolerando typos y variantes ("futvol" → "futbol", "padel"/"paddle" → "paddle", "basket"/"básquet" → "basquet").`,
    `- date: ISO YYYY-MM-DD. Convertí fechas relativas usando "hoy" como referencia. Ejemplos: "hoy" → ${today}, "mañana" → al día siguiente, "el viernes" → próximo viernes (si hoy es viernes, el viernes que viene), "este finde" → próximo sábado.`,
    `- location: string corto con el barrio/zona/ciudad mencionada, capitalizado (ej: "Palermo", "La Boca", "Núñez"). Corregí typos comunes ("palerno" → "Palermo").`,
    `- maxPrice: entero en pesos argentinos. Interpretá "lucas"/"luca" como miles (4 lucas = 4000). Solo si el texto sugiere un tope ("hasta", "máximo", "por menos de", "<"). Si dice "barato" sin número, null.`,
  ].join("\n");
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(EMPTY, { status: 200 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(EMPTY, { status: 200 });
  }

  const { query, today } = parsed.data;

  try {
    const { object } = await generateObject({
      model: anthropic("claude-haiku-4-5"),
      schema: filtersSchema,
      temperature: 0,
      system: systemPrompt(today),
      prompt: query,
    });
    return Response.json(object, { status: 200 });
  } catch {
    return Response.json(EMPTY, { status: 200 });
  }
}
