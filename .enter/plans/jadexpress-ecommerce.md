# JadeXpress Enterprise — E-commerce Storefront

## Context
JadeXpress currently sells vitamins, supplements and cosmetics through physical shops running a POS system (jadexpressgh.com). The goal is a new customer-facing e-commerce site so JadeXpress can sell nationally (Ghana) and internationally, with customers able to browse, order, pay and track deliveries, plus manage their own account.

Decisions confirmed with the client:
- **Backend**: Build on Enter Cloud now so the store is fully functional today. The existing POS API is a separate system; wiring it up (for live inventory/order sync) is a later phase once its docs are available — not part of this build.
- **Scope**: Customer storefront + customer account/dashboard only. Admin, inventory and supplier management stay in the existing POS — no admin panel is built here.
- **Payments**: Paystack (cards + MTN/Vodafone/AirtelTigo Mobile Money), settled in GHS. This also covers international card payments.
- **Brand direction**: Elevate the existing POS identity — deep forest green, gold/mustard accent, warm cream background, leaf mark — into a premium storefront look (confirmed, keep as-is).

The current project is the blank Vite/React/shadcn template (default blue/slate theme, single placeholder `Index` page). Everything below is net-new.

## Design Foundation
**Colors** (HSL tokens in `src/index.css`, consumed via `tailwind.config.ts` semantic names — no raw colors in components):
- `--background`: warm cream ~`38 35% 96%`
- `--foreground`: deep green-black text ~`160 25% 12%`
- `--primary`: deep forest green ~`158 45% 17%`, `--primary-foreground`: cream
- `--accent`: gold/mustard ~`42 70% 50%`, `--accent-foreground`: deep green (never gold text on light — contrast risk; gold used for badges, borders, icons, small caps labels, underlines)
- `--secondary`: soft cream-sage surface ~`150 15% 93%`
- `--muted` / `--muted-foreground`: warm gray-green tones
- `--border`/`--input`: soft cream border ~`38 20% 87%`
- New custom tokens: `--gradient-hero` (deep green → darker green diagonal), `--shadow-elegant` (green-tinted soft shadow), `--shadow-gold` (gold glow for CTAs), radius bumped to `0.75rem` for a premium rounded feel.
- Keep a `.dark` variant using the same palette inverted (dark green background, cream text) for consistency, even though the storefront defaults to light.

**Typography**: Add Google Fonts via `index.html` — a refined serif display face (Fraunces) for headings/hero copy to match the editorial serif already used in the POS ("The Vitamin Shop & Beauty Care"), paired with Inter for body/UI. Expose as `font-display` / `font-sans` in `tailwind.config.ts`.

**Logo**: Recreate the leaf mark with `lucide-react`'s `Leaf` icon inside a rounded deep-green badge (matches POS logo treatment) — crisp at any size, no raster asset needed.

**Imagery**: Generate a cohesive set of product-photography-style images (via `image_generation`) for: hero banner, 3 category headers (Vitamins, Supplements, Cosmetics), ~12 seed products, and an About/brand-story image — consistent lighting/palette so the store doesn't look empty on launch. Reuse the POS's initials-avatar style (colored square with initials) for any people references (testimonials, account avatar) instead of stock headshots, for brand consistency.

**Motion & "sticky/scroll" feel** (this is the core of the "wow" ask):
- Add `lenis` for smooth inertia-based page scrolling site-wide.
- Sticky header that starts transparent-over-hero and morphs to solid deep-green with shadow on scroll (via `framer-motion` `useScroll`, already installed).
- Scroll-reveal (`whileInView` fade/slide-up with stagger) on all homepage sections, category and product grids.
- Sticky filter sidebar on Shop page; sticky order summary on Checkout; sticky mobile "Add to Cart" bar on Product page that appears once the primary CTA scrolls out of view.
- Slide-in Cart drawer, animated mobile menu, subtle image hover-zoom on product cards, animated route/page transitions via `AnimatePresence`.

## Information Architecture & Routes
Public:
- `/` Home — hero, shop-by-category, featured/bestsellers, brand story, trust badges, testimonials, newsletter
- `/shop` — full catalog: filters (category, brand, price), sort, search
- `/category/:slug` — category landing (Vitamins / Supplements / Cosmetics)
- `/product/:slug` — gallery, price, stock, description/ingredients/usage tabs, reviews, related products
- `/checkout` — address + delivery + Paystack payment, order review
- `/checkout/success/:orderNumber` — confirmation
- `/track-order` — guest order lookup (order number + email)
- `/about`, `/contact`, `/faq`, `/shipping-returns`
- `/account/login`, `/account/register`, `/account/forgot-password`

Protected (`/account/*`, behind an auth guard):
- `/account` overview, `/account/orders` + `/account/orders/:id` (status timeline), `/account/addresses`, `/account/profile`, `/account/wishlist`

Cart is a global slide-over drawer (not a full page), available from the header everywhere.

## Backend (Enter Cloud) — load `enter_cloud` skill first
Tables + RLS:
- `profiles` (1:1 with `auth.users`): full_name, phone, avatar_url
- `addresses`: user_id, label, recipient_name, phone, country, region/city, street, digital_address (GhanaPost GPS), is_default — owner-only RLS
- `categories`: name, slug, image_url, sort_order — public read
- `products`: name, slug, description, category_id, brand, price, compare_at_price, sku, stock_quantity, images (jsonb array), ingredients, usage_instructions, is_featured, status — public read (status = active)
- `reviews`: product_id, user_id, rating, comment, created_at — public read, authenticated insert
- `wishlists`: user_id, product_id — owner-only
- `orders`: user_id (nullable for guest checkout), order_number, status, payment_status, payment_reference, subtotal, shipping_fee, total, currency (GHS), shipping_address (jsonb), created_at — owner or matching-email read, insert via backend function only
- `order_items`: order_id, product_id, name, price, quantity, image
- `order_status_history`: order_id, status, note, created_at — powers the tracking timeline

Cart is client-side (Context + localStorage) for guests; merged into a lightweight `cart_items` table on login so it persists across devices.

Backend functions:
- `paystack-initialize`: creates the pending `order` + `order_items`, calls Paystack Initialize Transaction with `PAYSTACK_SECRET_KEY`, returns reference for Paystack Inline
- `paystack-verify`: verifies the transaction server-side, marks order paid/processing, decrements `stock_quantity`, writes `order_status_history`
- Public track-order lookup done as a backend function (avoids exposing the full `orders` table to anon reads)

Secrets: `PAYSTACK_SECRET_KEY` via `supabase_add_secret` (the Paystack **public** key is not secret and goes directly in frontend code to drive the Paystack Inline popup, keeping checkout on-site instead of a redirect).

Auth: Enter Cloud email/password sign up, login, forgot-password reset; session via a small `AuthContext`/`useAuth` hook guarding `/account/*`.

## Key Files
- `src/index.css`, `tailwind.config.ts` — design tokens, fonts, shadows, radius
- `index.html` — Google Fonts, title/meta
- `src/router.tsx` — replaces the placeholder route with the full route list above
- `src/layouts/PublicLayout.tsx`, `src/layouts/AccountLayout.tsx` — shell + guard
- `src/components/layout/` — `Header`, `Footer`, `MobileMenu`, `CartDrawer`
- `src/components/product/` — `ProductCard`, `ProductGallery`, `ProductFilters`, `StarRating`, `PriceTag`, `QuantitySelector`
- `src/components/home/` — `Hero`, `CategoryShowcase`, `FeaturedProducts`, `BrandStory`, `TrustBadges`, `Testimonials`, `Newsletter`
- `src/context/CartContext.tsx`, `src/context/AuthContext.tsx`
- `src/hooks/` — React Query hooks wrapping Enter Cloud queries (`useProducts`, `useCategories`, `useOrders`, `useWishlist`, `useAddresses`)
- `src/pages/` — `Home`, `Shop`, `CategoryPage`, `ProductDetail`, `Checkout`, `CheckoutSuccess`, `TrackOrder`, `About`, `Contact`, `Faq`, `ShippingReturns`, and `account/*` pages
- Enter Cloud migration + backend function files, structured per the `enter_cloud` skill's conventions
- `src/pages/Index.tsx` retired/replaced by `Home.tsx`

## Implementation Checklist
- [manual-required] Enable Enter Cloud and add `PAYSTACK_SECRET_KEY` secret
- [passed] Rebuild `index.css`/`tailwind.config.ts` with the green/gold/cream token system, Fraunces + Inter fonts, elegant/gold shadow tokens
- [passed] Add `lenis` dependency and wire smooth scrolling app-wide
- [passed] Build `Header` (scroll-morphing sticky), `Footer`, `MobileMenu`, `CartDrawer`
- [passed] Create Enter Cloud schema: `profiles`, `addresses`, `categories`, `products`, `reviews`, `wishlists`, `cart_items`, `orders`, `order_items`, `order_status_history` with RLS
- [passed] Seed categories + ~12 products with generated imagery across Vitamins/Supplements/Cosmetics
- [passed] Build Home page (hero, category showcase, featured products, brand story, trust badges, testimonials, newsletter) with scroll-reveal animations
- [passed] Build Shop + Category pages (filters, sort, search, sticky filter sidebar)
- [passed] Build Product Detail page (gallery, tabs, reviews, related products, sticky mobile add-to-cart bar)
- [passed] Implement `CartContext` (localStorage for guests, synced `cart_items` for logged-in users)
- [passed] Implement Checkout page (address form incl. Ghana regions + GhanaPost GPS + international, sticky order summary) and `paystack-initialize`/`paystack-verify` backend functions with Paystack Inline popup
- [passed] Build Checkout success page and `/track-order` public lookup with status timeline
- [passed] Implement `AuthContext` + Login/Register/Forgot-password pages
- [passed] Build Account dashboard (`AccountLayout` guard + Overview, Orders/Order detail, Addresses, Profile, Wishlist)
- [passed] Build About, Contact, FAQ, Shipping & Returns static pages
- [passed] Replace placeholder `Index.tsx`/route with new `Home.tsx`; update `router.tsx` with the full route list
- [manual-required] Full responsive pass (mobile nav, mobile cart drawer, mobile checkout) and dark-mode-safe contrast check on all custom tokens

## Verification Checklist
- [manual-required] Home → Shop → Product → Add to cart → Cart drawer updates quantity/subtotal correctly
- [manual-required] Category and search filters on Shop page return correct, non-empty results; empty state shown for no matches
- [blocked] Guest checkout: fill address, pay with Paystack test card/MoMo, order created with correct `status`/`payment_status`, stock decremented
- [manual-required] Logged-in checkout: cart persists after logout/login; order appears in `/account/orders`
- [manual-required] `/track-order` returns correct status timeline for a valid order number + email, and a clear "not found" state for an invalid one
- [manual-required] Sign up, log in, forgot-password reset all work; `/account/*` redirects to login when signed out
- [manual-required] Sticky header morph, scroll-reveal sections, cart drawer animation, sticky add-to-cart bar all behave correctly on scroll up/down
- [manual-required] Mobile (375px), tablet, and desktop layouts verified via screenshot for Home, Shop, Product, Checkout, Account pages
- [manual-required] Lint and build pass with no errors
