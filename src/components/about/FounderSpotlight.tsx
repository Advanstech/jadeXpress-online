import { Camera, Quote } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SITE } from "@/config/site";

const stats = [
  { value: "1", label: "Passionate founder" },
  { value: "3+", label: "Curated categories" },
  { value: "GH +", label: "Serving Ghana & worldwide" },
];

/**
 * Founder spotlight for Hannah Aseidu. Shows the real portrait once
 * `SITE.founder.photo` is set; until then an elegant monogram placeholder is
 * shown so the section is already production-ready.
 */
export function FounderSpotlight() {
  const { name, role, photo } = SITE.founder;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="bg-secondary/40 py-20 md:py-28">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">The person behind the brand</span>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Meet the founder
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 rounded-2xl border border-border bg-card p-6 shadow-soft md:grid-cols-[300px_1fr] md:p-10">
            {/* Portrait / monogram placeholder */}
            <div className="mx-auto w-full max-w-[300px]">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-elegant">
                {photo ? (
                  <img
                    src={photo}
                    alt={name}
                    crossOrigin="anonymous"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center">
                    <span className="font-display text-7xl font-semibold tracking-tight text-primary-foreground">
                      {initials}
                    </span>
                  </div>
                )}
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-primary/85 py-2 text-xs font-medium text-primary-foreground backdrop-blur">
                  <Camera className="size-3.5" />
                  {photo ? "Founder portrait" : "Portrait coming soon"}
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="flex flex-col justify-center">
              <span className="eyebrow">Founder &amp; CEO</span>
              <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
                {name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{role}</p>

              <div className="relative mt-5 rounded-lg border border-border bg-secondary/50 p-4 text-sm leading-relaxed text-foreground/90">
                <Quote className="absolute -left-2 -top-2 size-6 rounded-full bg-accent p-1 text-accent-foreground" />
                <p>
                  “I started JadeXpress so that real, quality wellness — the
                  vitamins, supplements and beauty care our community trusts —
                  is always within reach, delivered with genuine care from the
                  heart of Accra to doorsteps across Ghana and beyond.”
                </p>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Hannah leads the enterprise from its Accra base — curating the
                range, partnering with trusted suppliers and couriers, and
                building the JadeXpress POS platform that powers the shops.
                Every product is chosen with the same care she'd give family.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border border-border bg-card p-3 text-center"
                  >
                    <p className="font-display text-xl font-semibold text-primary">
                      {s.value}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
