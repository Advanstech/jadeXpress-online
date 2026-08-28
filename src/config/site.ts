// Site-wide configuration for the JadeXpress storefront.

export const SITE = {
  name: "JadeXpress",
  legalName: "JadeXpress Enterprise",
  tagline: "The Vitamin Shop & Beauty Care",
  description:
    "Premium vitamins, supplements and cosmetics delivered across Ghana and worldwide.",
  // Real JadeXpress Enterprise contacts (found via public directory).
  email: "jadexpress2019@gmail.com",
  phone: "+233 20 404 7814",
  whatsapp: "+233 54 652 6066",
  addressLine: "JadeXpress Dzorwulu, Dzorwulu Cres",
  region: "Dzorwulu, Accra, Ghana",
  latitude: 5.6123405,
  longitude: -0.2063719,
  domain: "jadexpressgh.com",
  founder: {
    name: "Hannah Aseidu",
    role: "Founder & CEO",
    // Add the founder's portrait URL here when available — until then the
    // site shows an elegant monogram placeholder in its place.
    photo: "",
  },
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
  },
  currency: "GHS",
  // Orders above this (GHS) ship free within Ghana.
  freeShippingThreshold: 500,
  shippingFeeGhana: 35,
  shippingFeeInternational: 120,
};

export const NAV_LINKS = [
  { label: "Shop All", to: "/shop" },
  { label: "Vitamins", to: "/category/vitamins-minerals" },
  { label: "Supplements", to: "/category/supplements-wellness" },
  { label: "Beauty & Skin", to: "/category/beauty-skin" },
  { label: "Skincare", to: "/category/skincare-lotions" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

/**
 * Brands shown in the homepage "partners" marquee. These are the labels the
 * shop stocks or partners with. The marquee also merges in every distinct
 * `brand` found on live products, so the strip stays in sync with the
 * catalogue — edit here to curate the look.
 */
export const PARTNER_BRANDS = [
  "Glow Lab",
  "JadeXpress",
  "VitaCure",
  "Solé Skincare",
  "Pure Roots",
  "NutriGhana",
  "Aurelia Beauty",
  "Herbafrique",
];

/**
 * Paystack PUBLIC key — safe to expose in the frontend. Leave empty to run the
 * storefront in preview/demo mode: orders are still created in Enter Cloud as
 * `pending / unpaid`, but the Paystack Inline popup is skipped (no live charge).
 * Paste a test (`pk_test_…`) or live (`pk_live_…`) key here to enable card +
 * Mobile Money checkout.
 */
export const PAYSTACK_PUBLIC_KEY = "";

/** Existing POS API (staff-gated). Storefront integration is a later phase. */
export const POS_API_BASE = "https://jadexpress-api-production.up.railway.app";

/**
 * Courier fulfilment. `mock` returns estimates/tracking from our partner
 * providers (Speedaf Express in Ghana, DHL Express internationally) without
 * calling their APIs yet. Flip to `live` once the courier API keys are
 * onboarded — the checkout + order views are already wired to the same
 * interface.
 */
export const COURIER_MODE: "mock" | "live" = "mock";

/**
 * Payment gateway. We integrate with Advansis Technologies (GT Bank payment
 * API) for Mobile Money, debit and credit cards. `mock` simulates the whole
 * gateway flow; flip to `live` once Advansis hands over production
 * credentials. Kept alongside Paystack for reference.
 */
export const PAYMENT_MODE: "mock-advansis" | "live-advansis" | "paystack" =
  "mock-advansis";

/** Admin roles, strongest → weakest. */
export const ADMIN_ROLES = ["owner", "super_admin", "admin", "manager", "supervisor", "stock_officer"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];
export const isAdminRole = (role?: string | null) =>
  !!role && (ADMIN_ROLES as readonly string[]).includes(role);

/**
 * Google Maps PUBLIC key — restrict it to your domain in the Google Cloud
 * console (HTTP referrer restriction), then paste it here. It powers:
 *  - accurate address-autocomplete while typing (Places API — New)
 *  - the interactive map on the Contact page (Maps Embed API)
 * Leave empty to keep running on the free, no-key fallbacks (OpenStreetMap
 * search + a keyless map embed) — everything still works, just less precise.
 */
export const GOOGLE_MAPS_API_KEY = "";

export const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Central",
  "Eastern",
  "Volta",
  "Northern",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
  "Western North",
  "Oti",
  "Savannah",
  "North East",
];
