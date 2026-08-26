"use client";
import { GOOGLE_MAPS_API_KEY, SITE } from "@/config/site";

/**
 * Google Map of the shop location. Uses the Maps Embed API when
 * `GOOGLE_MAPS_API_KEY` is set (site config); otherwise falls back to a
 * keyless Google Maps embed so the map still renders out of the box.
 */
export function ContactMap() {
  const coords = `${SITE.latitude},${SITE.longitude}`;
  const src = GOOGLE_MAPS_API_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${coords}&zoom=15`
    : `https://www.google.com/maps?q=${coords}&z=15&output=embed`;

  return (
    <div className="h-72 w-full overflow-hidden rounded-lg border border-border shadow-soft sm:h-80">
      <iframe
        title={`${SITE.legalName} location`}
        src={src}
        className="h-full w-full"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
