# Paki Toys Storefront Demo Design

## Goal

Create a polished, clickable Portuguese-language storefront demo for Paki Toys. The demo should make the future site direction tangible before heavy commerce implementation begins, while keeping the frontend straightforward to connect to Medusa later.

## Scope

The demo is a responsive React/Vite frontend with local catalog data derived from `adrianmircus/pakitoys-medusa-b2b`. It includes the homepage, product discovery interactions, product quick view, favorites, and a client-side cart drawer. It does not include checkout, authentication, a CMS, persistence across devices, or a running Medusa backend.

## Visual Direction

The design keeps Paki Toys recognizable through its navy and red palette, rounded logo, playful typography, Portuguese copy, real product imagery, and toy-focused categories. It replaces the current site's dated full-width carousel treatment with a brighter editorial composition built around the idea “Brincar faz a imaginação decolar.”

The page combines generous white space with oversized playful shapes, sticker-like labels, rounded product surfaces, and controlled motion. Navy provides structure, red provides emphasis, and warm cream, sky blue, and yellow keep the interface friendly without becoming visually noisy.

## Page Structure

1. Announcement bar with a concise retailer/availability message.
2. Responsive header with logo, category navigation, search, favorites, and cart count.
3. Editorial hero with a primary catalog call to action and featured Paki product imagery.
4. Category cards for Maletas, Imaginação, Jogos, Motora, Paki Baby, Senninha, and Monta Roda.
5. Featured product grid using the Paki Toys logo, product imagery, product names, and metadata from the reference repository.
6. Brand-value section focused on learning, imagination, motor development, and safe play.
7. Promotional banner and catalog call to action.
8. Newsletter prompt and a substantial company/contact footer.

## Functional Behavior

- Search filters visible products by product name, category, or short description.
- Category selection filters the product grid and visibly shows the active category.
- Product cards support favorite toggling, quick view, and adding one item to the cart.
- Quick view shows the image, category, description, age guidance, and add-to-cart action.
- The cart opens as a drawer, lists line items, supports quantity increase/decrease and removal, calculates an item subtotal, and includes a clearly disabled demo checkout action.
- The mobile menu and all overlays are keyboard dismissible and manage focus appropriately.
- Cart and favorite state live in the browser for the current session only.
- Product and category links remain within the single-page demo and do not imply completed routes.

## Asset and Catalog Source

The Paki Toys assets and catalog reference come from `https://github.com/adrianmircus/pakitoys-medusa-b2b`. The implementation copies the repository's Paki logo and 12 WebP product images into this project's public assets; it does not hotlink them from GitHub or the live Paki Toys site.

The initial catalog preserves the source repository's product names, handles, categories, age ranges, reference numbers, EAN/DUN values, case quantities, dimensions, weight, and cubage. The primary storefront surfaces only customer-friendly information such as title, category, age guidance, image, and demo price. The remaining B2B fields stay in the domain model so a later Medusa connection can support wholesale workflows without reworking the product schema.

## Architecture

The project uses React, TypeScript, and Vite. UI components consume a small catalog repository interface rather than importing mock arrays directly. The initial repository returns local data synchronously or through an async-compatible API. A future Medusa adapter can implement the same interface and map Medusa product/category responses into the demo's domain types.

The main units are:

- `domain`: product and category types used by the UI.
- `data`: local catalog content transcribed from the reference repository and the repository implementation.
- `services`: cart calculations and catalog querying kept independent of rendering.
- `components`: focused UI pieces such as header, hero, category rail, product card, quick-view modal, cart drawer, and footer.
- `App`: page composition and top-level interaction state.

No speculative API client, authentication layer, routing system, or backend configuration will be added for the demo.

## Error and Empty States

- A search or category filter with no results shows a friendly reset action.
- Missing product images fall back to a branded placeholder, although all 12 reference products are expected to use their copied WebP assets.
- Cart quantity cannot fall below one; removing the final unit removes the line.
- Checkout remains visibly marked as unavailable in the demo instead of leading to a broken flow.

## Accessibility and Responsive Requirements

- Semantic regions, labeled icon buttons, visible focus states, and sufficient color contrast.
- Modal and drawer controls expose dialog semantics and close with Escape.
- Interactive controls remain usable by keyboard.
- Layout is verified at mobile, tablet, and desktop widths.
- Motion respects `prefers-reduced-motion`.

## Verification

- TypeScript compilation and the production build succeed.
- All copied logo and product assets load locally with no GitHub or Paki-site hotlinks.
- Component/service tests cover search filtering and cart calculations.
- Browser verification confirms navigation, category filtering, search, favorites, quick view, cart updates, drawer controls, and empty results.
- Desktop and mobile screenshots are visually reviewed for overflow, hierarchy, spacing, and legibility.
- Browser console contains no application errors during the tested flows.

## Success Criteria

The result is presentation-ready, recognizably Paki Toys, meaningfully more contemporary than the current site, and complete enough to demonstrate the future shopping experience. The frontend's product and category consumption is isolated behind a replaceable interface so a later Medusa integration does not require rebuilding the visual layer.
