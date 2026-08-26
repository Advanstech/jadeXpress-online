import { Leaf, ShieldCheck, Sprout } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

const BRAND_IMAGE =
  "https://cdn.enter.pro/resources/uid_100467878/jadexpress-brand_514daabb.png";

const pillars = [
  {
    icon: Sprout,
    title: "Rooted in nature",
    text: "Botanically-inspired formulas and unrefined Ghanaian shea, sourced with intention.",
  },
  {
    icon: ShieldCheck,
    title: "Quality you can trust",
    text: "Third-party tested supplements and clean-beauty standards — never tested on animals.",
  },
  {
    icon: Leaf,
    title: "Care, end to end",
    text: "From our shops to your door — thoughtful packaging and delivery across Ghana and beyond.",
  },
];

export function BrandStory() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <div className="relative">
            <div className="overflow-hidden rounded-lg border border-border shadow-elegant">
              <img
                src={BRAND_IMAGE}
                alt="The JadeXpress apothecary story"
                crossOrigin="anonymous"
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-4 hidden rounded-lg border border-border bg-card p-5 shadow-elegant sm:block">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Leaf className="size-5" />
                </span>
                <div>
                  <p className="font-display text-2xl font-semibold text-foreground">
                    Since day one
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The Vitamin Shop & Beauty Care
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <span className="eyebrow">Our story</span>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Wellness, the JadeXpress way
            </h2>
            <p className="mt-5 text-muted-foreground">
              JadeXpress began in our shops — a neighbourhood vitamin counter and
              beauty care counter loved across Ghana. Today we bring that same
              warmth, expertise and care online, so the wellness you trust is
              always within reach.
            </p>
          </Reveal>

          <div className="mt-8 grid gap-5">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <div className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                    <p.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {p.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
