"use client";
import { useEffect, useRef, useState } from "react";
import { GOOGLE_MAPS_API_KEY } from "@/config/site";

export interface AddressSuggestion {
  label: string;
  street: string;
  city: string;
  region: string;
  country: string;
  lat: string;
  lon: string;
  /** Present for Google suggestions whose address details aren't fetched yet. */
  placeId?: string;
}

interface NominatimAddress {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  street?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  region?: string;
  country?: string;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
}

function parseSuggestion(item: NominatimResult): AddressSuggestion {
  const a = item.address ?? {};
  const street =
    [a.house_number, a.road ?? a.pedestrian ?? a.street].filter(Boolean).join(" ") ||
    a.neighbourhood ||
    a.suburb ||
    "";
  const city = a.city || a.town || a.village || a.municipality || a.county || "";
  const region = a.state || a.region || "";
  const country = a.country || "";
  return {
    label: item.display_name,
    street,
    city,
    region,
    country,
    lat: item.lat,
    lon: item.lon,
  };
}

interface GooglePlacePrediction {
  placePrediction?: {
    placeId: string;
    text?: { text?: string };
  };
}

async function fetchGoogleSuggestions(
  query: string,
  countryBias: string | undefined,
  signal: AbortSignal,
): Promise<AddressSuggestion[]> {
  const body: Record<string, unknown> = { input: query };
  if (countryBias?.toLowerCase().includes("ghana")) {
    body.includedRegionCodes = ["gh"];
  }
  const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  const suggestions: GooglePlacePrediction[] = Array.isArray(json.suggestions)
    ? json.suggestions
    : [];
  return suggestions
    .filter((s) => s.placePrediction?.placeId)
    .map((s) => ({
      label: s.placePrediction!.text?.text ?? "",
      street: "",
      city: "",
      region: "",
      country: "",
      lat: "",
      lon: "",
      placeId: s.placePrediction!.placeId,
    }));
}

interface GoogleAddressComponent {
  longText?: string;
  types: string[];
}
interface GooglePlaceDetails {
  addressComponents?: GoogleAddressComponent[];
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
}

/**
 * Resolves a suggestion into a fully-populated address. OpenStreetMap
 * suggestions already carry every field; Google Places suggestions only
 * carry a place id, so we fetch its details (Places API — New) on demand.
 */
export async function resolveAddressSuggestion(
  suggestion: AddressSuggestion,
): Promise<AddressSuggestion> {
  if (!suggestion.placeId || !GOOGLE_MAPS_API_KEY) return suggestion;
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${suggestion.placeId}`,
      {
        headers: {
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask": "addressComponents,formattedAddress,location",
        },
      },
    );
    const json: GooglePlaceDetails = await res.json();
    const comps = json.addressComponents ?? [];
    const find = (type: string) =>
      comps.find((c) => c.types.includes(type))?.longText ?? "";
    const street =
      [find("street_number"), find("route")].filter(Boolean).join(" ") ||
      find("sublocality") ||
      find("neighborhood");
    const city =
      find("locality") ||
      find("postal_town") ||
      find("administrative_area_level_2");
    return {
      ...suggestion,
      label: json.formattedAddress || suggestion.label,
      street,
      city,
      region: find("administrative_area_level_1"),
      country: find("country"),
      lat: json.location ? String(json.location.latitude) : "",
      lon: json.location ? String(json.location.longitude) : "",
    };
  } catch {
    return suggestion;
  }
}

/**
 * Address search for the street-address field. Uses Google Places (New) when
 * `GOOGLE_MAPS_API_KEY` is set for the most accurate, up-to-date results;
 * otherwise falls back to free OpenStreetMap Nominatim — no key required.
 */
export function useAddressSearch(query: string, countryBias?: string) {
  const [results, setResults] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!query || query.trim().length < 3) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setLoading(true);

      const task = GOOGLE_MAPS_API_KEY
        ? fetchGoogleSuggestions(query, countryBias, controller.signal)
        : (async () => {
            const params = new URLSearchParams({
              format: "json",
              addressdetails: "1",
              limit: "5",
              q: query,
            });
            if (countryBias?.toLowerCase().includes("ghana")) {
              params.set("countrycodes", "gh");
            }
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?${params.toString()}`,
              { signal: controller.signal, headers: { Accept: "application/json" } },
            );
            const json: NominatimResult[] = await res.json();
            return Array.isArray(json) ? json.map(parseSuggestion) : [];
          })();

      task
        .then(setResults)
        .catch(() => {
          /* aborted or network error — ignore */
        })
        .finally(() => setLoading(false));
    }, 450);

    return () => clearTimeout(handle);
  }, [query, countryBias]);

  return { results, loading };
}
