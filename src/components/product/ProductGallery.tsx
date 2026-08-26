"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  if (images.length === 0) {
    return <div className="aspect-square rounded-lg bg-secondary" />;
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-card shadow-elegant">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]}
            alt={`${name} — view ${active + 1}`}
            crossOrigin="anonymous"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="size-full object-cover"
          />
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative size-16 overflow-hidden rounded-md border-2 bg-secondary transition-all",
                active === i
                  ? "border-primary"
                  : "border-transparent hover:border-border",
              )}
            >
              <img
                src={img}
                alt={`${name} thumbnail ${i + 1}`}
                crossOrigin="anonymous"
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
