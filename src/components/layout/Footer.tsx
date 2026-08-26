"use client";
import { Link } from "@/components/Link";
import { Leaf, Mail, MapPin, Phone, Instagram, Facebook, Twitter } from "lucide-react";
import { Logo } from "./Logo";
import { SITE } from "@/config/site";

const shopLinks = [
  { label: "All products", to: "/shop" },
  { label: "Vitamins", to: "/category/vitamins" },
  { label: "Supplements", to: "/category/supplements" },
  { label: "Cosmetics", to: "/category/cosmetics" },
];

const helpLinks = [
  { label: "Track your order", to: "/track-order" },
  { label: "Wellness quiz", to: "/quiz" },
  { label: "Shipping & returns", to: "/shipping-returns" },
  { label: "FAQs", to: "/faq" },
  { label: "Contact us", to: "/contact" },
];

const companyLinks = [
  { label: "Our story", to: "/about" },
  { label: "Sign in", to: "/account/login" },
  { label: "Create account", to: "/account/register" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            {SITE.description}
          </p>
          <div className="mt-5 flex flex-col gap-2 text-sm text-muted-foreground">
            <a
              href={`tel:${SITE.phone}`}
              className="flex items-center gap-2 transition-colors hover:text-primary"
            >
              <Phone className="size-4 text-accent" /> {SITE.phone}
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="flex items-center gap-2 transition-colors hover:text-primary"
            >
              <Mail className="size-4 text-accent" /> {SITE.email}
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-accent" /> {SITE.addressLine},{" "}
              {SITE.region}
            </span>
          </div>
        </div>

        <FooterCol title="Shop" links={shopLinks} />
        <FooterCol title="Help" links={helpLinks} />
        <FooterCol title="Company" links={companyLinks} />
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <p className="flex items-center gap-2">
            <Leaf className="size-4 text-accent" />
            © {new Date().getFullYear()} {SITE.legalName}. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a href={SITE.social.instagram} aria-label="Instagram" className="transition-colors hover:text-primary"><Instagram className="size-4" /></a>
            <a href={SITE.social.facebook} aria-label="Facebook" className="transition-colors hover:text-primary"><Facebook className="size-4" /></a>
            <a href={SITE.social.twitter} aria-label="Twitter" className="transition-colors hover:text-primary"><Twitter className="size-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) {
  return (
    <div>
      <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
