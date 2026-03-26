import { z } from "zod";

const DEFAULT_BASE_URL = "https://places.googleapis.com/v1";
const DEFAULT_TIMEOUT_MS = 10000;

const addressComponentSchema = z.object({
  longText: z.string(),
  shortText: z.string().optional(),
  types: z.array(z.string()),
});

const placeSchema = z.object({
  id: z.string(),
  displayName: z
    .object({
      text: z.string(),
      languageCode: z.string().optional(),
    })
    .optional(),
  formattedAddress: z.string().optional(),
  nationalPhoneNumber: z.string().optional(),
  addressComponents: z.array(addressComponentSchema).optional(),
});

const textSearchResponseSchema = z.object({
  places: z.array(placeSchema).optional(),
  nextPageToken: z.string().optional(),
});

type Place = z.infer<typeof placeSchema>;

export type NormalizedPlaceLead = {
  placeId: string;
  nomeEmpresa: string;
  telefone: string | null;
  enderecoCompleto: string;
  numero: string | null;
  rua: string | null;
  bairro: string | null;
  cidade: string;
  estado: string | null;
};

export type GooglePlacesSearchInput = {
  termo: string;
  cidade: string;
  limite: number;
  pageToken?: string;
};

export type GooglePlacesSearchResult = {
  leads: NormalizedPlaceLead[];
  nextPageToken?: string;
};

export async function searchPlacesByText(
  input: GooglePlacesSearchInput
): Promise<GooglePlacesSearchResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY nao definido.");
  }

  const baseUrl = process.env.GOOGLE_PLACES_BASE_URL ?? DEFAULT_BASE_URL;
  const timeoutMs = Number(process.env.GOOGLE_PLACES_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const maxRetries = Number(process.env.GOOGLE_PLACES_MAX_RETRIES ?? 2);

  const body: Record<string, unknown> = {
    textQuery: `${input.termo} em ${input.cidade}`,
    maxResultCount: input.limite,
    languageCode: process.env.GOOGLE_PLACES_LANGUAGE ?? "pt-BR",
    regionCode: process.env.GOOGLE_PLACES_REGION ?? "BR",
  };

  if (input.pageToken) {
    body.pageToken = input.pageToken;
  }

  const response = await fetchWithRetry(
    `${baseUrl}/places:searchText`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.addressComponents,nextPageToken",
      },
      body: JSON.stringify(body),
    },
    timeoutMs,
    maxRetries
  );

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Falha no Google Places: ${response.status} - ${responseText}`);
  }

  const json = (await response.json()) as unknown;
  const parsed = textSearchResponseSchema.parse(json);

  const places = parsed.places ?? [];
  const leads = places
    .map((place) => normalizePlace(place, input.cidade))
    .filter((lead): lead is NormalizedPlaceLead => lead !== null);

  return {
    leads,
    nextPageToken: parsed.nextPageToken,
  };
}

function normalizePlace(place: Place, cidadeFallback: string): NormalizedPlaceLead | null {
  const nomeEmpresa = place.displayName?.text?.trim();
  const enderecoCompleto = place.formattedAddress?.trim();

  if (!nomeEmpresa || !enderecoCompleto) {
    return null;
  }

  const numero = extractAddressComponent(place.addressComponents, ["street_number"]);
  const rua = extractAddressComponent(place.addressComponents, ["route"]);
  const bairro = extractAddressComponent(place.addressComponents, [
    "sublocality",
    "sublocality_level_1",
    "neighborhood",
  ]);
  const cidade =
    extractAddressComponent(place.addressComponents, ["locality"]) ??
    extractAddressComponent(place.addressComponents, ["administrative_area_level_2"]) ??
    cidadeFallback;
  const estado = extractAddressComponent(place.addressComponents, ["administrative_area_level_1"], {
    preferShort: true,
  });

  return {
    placeId: place.id,
    nomeEmpresa,
    telefone: place.nationalPhoneNumber?.trim() ?? null,
    enderecoCompleto,
    numero,
    rua,
    bairro,
    cidade,
    estado,
  };
}

function extractAddressComponent(
  components: Place["addressComponents"],
  acceptedTypes: string[],
  options?: { preferShort?: boolean }
): string | null {
  if (!components || components.length === 0) {
    return null;
  }

  const component = components.find((item) =>
    item.types.some((itemType) => acceptedTypes.includes(itemType))
  );

  if (!component) {
    return null;
  }

  if (options?.preferShort && component.shortText) {
    return component.shortText.trim();
  }

  return component.longText.trim();
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number,
  maxRetries: number
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await fetchWithTimeout(input, init, timeoutMs);

      if (isRetriableStatus(response.status) && attempt < maxRetries) {
        await wait(backoffMs(attempt));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;

      if (attempt >= maxRetries) {
        throw error;
      }

      await wait(backoffMs(attempt));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Falha ao consultar Google Places após tentativas.");
}

function isRetriableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

function backoffMs(attempt: number): number {
  return 300 * 2 ** attempt;
}

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
