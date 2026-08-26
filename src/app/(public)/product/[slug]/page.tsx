"use client";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/components/Link";
import { useParams } from "next/navigation";
import { useNavigate } from "@/hooks/useNavigate";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Heart,
  Minus,
  PackageOpen,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useProduct, useReviews, useRelatedProducts } from "@/hooks/useProduct";
import { useCategories } from "@/hooks/useCategories";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductInsights } from "@/components/product/ProductInsights";
import { PriceTag } from "@/components/product/PriceTag";
import { StarRating, StarInput } from "@/components/product/StarRating";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Reveal, StaggerGroup, staggerItem } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import { formatDate, formatGHS } from "@/lib/format";

export default function ProductDetail() {
  const { slug } = useParams() as { slug: string };
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(slug);
  const { data: categories } = useCategories();
  const { data: reviews } = useReviews(product?.id);
  const { data: related } = useRelatedProducts(product);
  const { addItem } = useCart();
  const { user, profile } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const qc = useQueryClient();

  const [qty, setQty] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQty(1), [slug]);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const obs = new window.IntersectionObserver(
      ([entry]) => {
        setShowBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [product?.id]);

  if (isLoading) {
    return (
      <div className="container grid gap-10 py-10 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <PackageOpen className="size-12 text-muted-foreground" />
        <h1 className="font-display text-2xl font-semibold">Product not found</h1>
        <Button asChild>
          <Link to="/shop">Back to shop</Link>
        </Button>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock < 10;
  const category = categories?.find((c) => c.slug === product.categorySlug);

  const handleAdd = () => {
    addItem(product, qty);
    toast.success(`${product.name} added to cart`);
  };

  const buyNow = () => {
    addItem(product, qty);
    navigate("/checkout");
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!reviewText.trim()) {
      toast.error("Please write a few words.");
      return;
    }
    setSubmitting(true);
    toast.info("Reviews are not connected to the API yet.");
    setReviewText("");
    setReviewRating(5);
    setSubmitting(false);
  };

  return (
    <div className="bg-background">
      <div className="container py-8 md:py-12">
        <nav className="mb-6 flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="size-3" />
          <Link to="/shop" className="hover:text-primary">Shop</Link>
          {category && (
            <>
              <ChevronRight className="size-3" />
              <Link to={`/category/${category.slug}`} className="hover:text-primary">
                {category.name}
              </Link>
            </>
          )}
          <ChevronRight className="size-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <ProductGallery images={product.images} name={product.name} />

          <div className="flex flex-col gap-5">
            <div>
              <span className="eyebrow">{product.brand}</span>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {product.name}
              </h1>
              <div className="mt-3 flex items-center gap-3">
                <StarRating rating={product.rating} count={product.reviewCount} size={16} />
              </div>
            </div>

            <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />

            <p className="text-muted-foreground">{product.shortDescription}</p>

            <div className="flex items-center gap-2 text-sm">
              {outOfStock ? (
                <Badge variant="secondary" className="bg-muted text-muted-foreground">Out of stock</Badge>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-medium text-primary">
                  <Check className="size-4" /> In stock
                  {lowStock && (
                    <span className="text-accent">· only {product.stock} left</span>
                  )}
                </span>
              )}
            </div>

            <Separator />

            <div ref={ctaRef} className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <QuantitySelector
                  value={qty}
                  onChange={setQty}
                  max={Math.max(1, product.stock)}
                />
                <Button
                  size="lg"
                  className="flex-1 shadow-gold"
                  disabled={outOfStock}
                  onClick={handleAdd}
                >
                  <ShoppingBag className="mr-2 size-4" />
                  Add to cart · {formatGHS(product.price * qty)}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-3"
                  disabled={outOfStock}
                  onClick={buyNow}
                >
                  Buy now
                </Button>
                {user && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-11"
                    onClick={() => toggle(product.id)}
                    aria-label="Toggle wishlist"
                  >
                    <Heart
                      className={cn(
                        "size-5",
                        isWishlisted(product.id) && "fill-destructive text-destructive",
                      )}
                    />
                  </Button>
                )}
              </div>

              <ul className="grid gap-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Truck className="size-4 text-accent" />
                  Free delivery in Ghana over GHS 500 · ships worldwide
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-accent" />
                  Authentic product · sealed packaging
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-secondary/40 p-4">
              <p className="text-sm font-medium text-foreground">Key benefits</p>
              <ul className="mt-2 grid gap-1.5">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <ProductInsights productId={product.id} />
          </div>
        </div>

        <Reveal className="mt-14">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="bg-secondary">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="usage">How to use</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({reviews?.length ?? 0})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </TabsContent>
            <TabsContent value="ingredients" className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {product.ingredients}
            </TabsContent>
            <TabsContent value="usage" className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {product.usage}
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                  {(reviews ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No reviews yet — be the first to share your experience.
                    </p>
                  ) : (
                    (reviews ?? []).map((r) => (
                      <div key={r.id} className="rounded-lg border border-border bg-card p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{r.author}</span>
                            <StarRating rating={r.rating} showCount={false} size={13} />
                          </div>
                          <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="rounded-lg border border-border bg-card p-5">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Write a review
                  </h3>
                  {user ? (
                    <form className="mt-4 space-y-3" onSubmit={submitReview}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Your rating</span>
                        <StarInput value={reviewRating} onChange={setReviewRating} />
                      </div>
                      <Textarea
                        placeholder="Share your experience…"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={4}
                      />
                      <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? "Submitting…" : "Submit review"}
                      </Button>
                    </form>
                  ) : (
                    <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                      <p>Sign in to share your experience with this product.</p>
                      <Button asChild className="w-full">
                        <Link to="/account/login">Sign in</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Reveal>
      </div>

      {(related ?? []).length > 0 && (
        <section className="border-t border-border bg-secondary/40 py-16">
          <div className="container">
            <Reveal>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                You may also like
              </h2>
            </Reveal>
            <StaggerGroup className="mt-8 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
              {(related ?? []).map((p) => (
                <motion.div key={p.id} variants={staggerItem}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* Sticky mobile add-to-cart bar */}
      <motion.div
        initial={false}
        animate={{ y: showBar ? 0 : 120 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 backdrop-blur md:hidden"
      >
        <div className="container flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
            <p className="text-sm font-semibold text-primary">{formatGHS(product.price)}</p>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="grid size-7 place-items-center rounded-full hover:bg-secondary"
              aria-label="Decrease"
            >
              <Minus className="size-3" />
            </button>
            <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
            <button
              onClick={() => setQty(Math.min(product.stock, qty + 1))}
              className="grid size-7 place-items-center rounded-full hover:bg-secondary"
              aria-label="Increase"
            >
              <Plus className="size-3" />
            </button>
          </div>
          <Button size="sm" className="shadow-gold" disabled={outOfStock} onClick={handleAdd}>
            <ShoppingBag className="mr-1 size-4" />
            Add
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
