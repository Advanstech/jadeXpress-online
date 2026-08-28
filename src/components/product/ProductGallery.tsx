"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";

import { getIntelligentTheme } from "@/lib/product-theme";

interface ProductGalleryProps {
  images: string[];
  name: string;
  categoryName?: string;
}

export function ProductGallery({ images = [], name, categoryName }: ProductGalleryProps) {
  const validImages = images.filter((img) => Boolean(img && img.trim()));
  const [active, setActive] = useState(0);
  const theme = getIntelligentTheme(categoryName, name);

  if (validImages.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-border bg-card/60 text-muted-foreground/30">
        <PackageOpen className="size-16" style={{ color: theme.accent }} />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-elegant">
        {/* Ambient Radial Spotlight Glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-85 transition-opacity duration-500"
          style={{ background: theme.gradient }}
        />

        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={validImages[active]}
            alt={`${name} — view ${active + 1}`}
            crossOrigin="anonymous"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 size-full object-contain"
            style={{
              filter: "drop-shadow(0 14px 22px rgba(0, 0, 0, 0.2))",
            }}
          />
        </AnimatePresence>
      </div>
      {validImages.length > 1 && (
        <div className="flex gap-2">
          {validImages.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative flex size-16 items-center justify-center overflow-hidden rounded-xl border-2 bg-card p-1 transition-all",
                active === i
                  ? "border-primary shadow-xs"
                  : "border-border hover:border-primary/50",
              )}
            >
              <img
                src={img}
                alt={`${name} thumbnail ${i + 1}`}
                crossOrigin="anonymous"
                className="size-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
