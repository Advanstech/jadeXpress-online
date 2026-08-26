import { COURIER_MODE } from "@/config/site";

export interface CourierQuote {
  provider: string;
  service: string;
  eta: string;
  fee: number;
  free: boolean;
  trackingNumber?: string;
  isGhana: boolean;
  note?: string;
}

export interface CourierInfo extends CourierQuote {
  /** Set on the order once it's placed. */
  trackingNumber?: string;
}

function mockQuote(country: string, subtotal: number): CourierQuote {
  const isGhana = country.toLowerCase().includes("ghana");
  return isGhana
    ? {
        provider: "Speedaf Express",
        service: "Speedaf Door-to-Door",
        eta: "1–3 business days",
        fee: subtotal >= 500 ? 0 : 35,
        free: subtotal >= 500,
        trackingNumber: `SFD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        isGhana: true,
      }
    : {
        provider: "DHL Express",
        service: "DHL Express Worldwide",
        eta: "3–7 business days",
        fee: 120,
        free: false,
        trackingNumber: `DHL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        isGhana: false,
      };
}

/** Returns a local mock courier estimate. Live API not wired yet. */
export async function getCourierQuote(
  country: string,
  subtotal: number,
  _weight?: number,
): Promise<CourierQuote> {
  if (COURIER_MODE === "live") {
    // TODO: call the onboarded courier APIs (Speedaf / DHL) here.
  }
  return mockQuote(country, subtotal);
}
