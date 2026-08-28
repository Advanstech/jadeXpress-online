"use client";
import { GOOGLE_MAPS_API_KEY, SITE } from "@/config/site";

/**
 * Google Map of the shop location. Uses the Maps Embed API when
 * `GOOGLE_MAPS_API_KEY` is set (site config); otherwise falls back to a
 * keyless Google Maps embed so the map still renders out of the box.
 */
export function ContactMap() {
  const query = encodeURIComponent("JadeXpress, Dzorwulu Cres, Accra, Ghana");
  const coords = `${SITE.latitude},${SITE.longitude}`;
  const src = GOOGLE_MAPS_API_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${query}&zoom=16`
    : `https://www.google.com/maps?q=${coords}&z=16&output=embed`;

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-border shadow-soft sm:h-80 group">
      <iframe
        title={`${SITE.legalName} location`}
        src={src}
        className="h-full w-full"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl border border-border/80 bg-background/95 px-3 py-2 text-xs shadow-soft backdrop-blur-xs">
        <div className="flex items-center gap-2 truncate">
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-[11px] text-primary">
            📍
          </span>
          <span className="truncate font-medium text-foreground">
            {SITE.addressLine}, {SITE.region}
          </span>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${query}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 shrink-0 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Open in Maps ↗
        </a>
      </div>
    </div>
  );
}
