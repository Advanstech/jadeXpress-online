import type { Category, CategorySlug, Product } from "@/types";
import { getProductRatingSummary } from "./reviews";

export interface ApiProduct {
  id: string;
  sku: string;
  slug?: string | null;
  name: string;
  genericName?: string | null;
  brand?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  dosageForm?: string | null;
  strength?: string | null;
  packSize?: number | null;
  unit?: string | null;
  type?: string | null;
  status: string;
  sellingPricePesewas: number;
  compareAtPricePesewas?: number | null;
  images?: string[];
  imageUrl?: string | null;
  quantity?: number;
  stockLevel?: number;
  isFeatured?: boolean;
  isBestseller?: boolean;
  rating?: number;
  reviewCount?: number;
  ingredients?: string | null;
  usageInstructions?: string | null;
  benefits?: string[];
}

export function mapApiProduct(p: ApiProduct): Product {
  const images: string[] =
    p.images && p.images.length > 0
      ? p.images
      : p.imageUrl
        ? [p.imageUrl]
        : [];

  const rawDescription = p.description || p.genericName || "";
  const shortDescription =
    p.shortDescription ||
    (rawDescription.length > 120 ? `${rawDescription.slice(0, 117)}…` : rawDescription);

  const { rating, reviewCount } = getProductRatingSummary(
    p.id,
    Number(p.rating ?? 0),
    p.reviewCount ?? 0,
    p.name,
    p.categorySlug || p.categoryName || "",
  );

  return {
    id: p.id,
    slug: p.slug ?? "",
    name: p.name,
    brand: p.brand ?? "",
    genericName: p.genericName ?? undefined,
    dosageForm: p.dosageForm ?? undefined,
    strength: p.strength ?? undefined,
    packSize: p.packSize ?? undefined,
    unit: p.unit ?? undefined,
    categoryId: p.categoryId ?? null,
    categorySlug: (p.categorySlug ?? p.categoryName ?? "supplements") as CategorySlug,
    price: p.sellingPricePesewas / 100,
    compareAtPrice:
      p.compareAtPricePesewas != null ? p.compareAtPricePesewas / 100 : null,
    sku: p.sku,
    stock: p.quantity ?? p.stockLevel ?? 0,
    rating,
    reviewCount,
    images,
    shortDescription,
    description: rawDescription,
    ingredients: p.ingredients ?? "",
    usage: p.usageInstructions ?? "",
    benefits: p.benefits ?? [],
    isFeatured: p.isFeatured ?? false,
    isBestseller: p.isBestseller ?? false,
    status: p.status,
  };
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  tagline?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  parentId?: string | null;
  isActive?: boolean;
}

export function mapApiCategory(c: ApiCategory): Category {
  return {
    id: c.id,
    slug: c.slug as CategorySlug,
    name: c.name,
    tagline: c.tagline ?? "",
    description: c.description ?? "",
    image: c.imageUrl || `/categories/${c.slug}.jpg`,
    sortOrder: c.sortOrder ?? 0,
  };
}
