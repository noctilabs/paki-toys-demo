# Paki Toys Storefront Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a presentation-ready Portuguese Paki Toys storefront demo with local reference assets, search, category filters, favorites, quick view, and a working client-side cart.

**Architecture:** A single Vite/React application consumes products through a `CatalogRepository` interface. Pure catalog and cart services hold searchable/filterable product logic and cart calculations; focused React components render the experience and top-level state stays in `App`.

**Tech Stack:** React 19, TypeScript 5, Vite 7, Vitest, CSS, local WebP assets.

## Global Constraints

- Use the logo, 12 product images, and catalog records from `adrianmircus/pakitoys-medusa-b2b`; do not hotlink assets.
- Keep the interface Portuguese-first and recognizably Paki Toys.
- Do not add checkout, authentication, CMS, routing, Medusa configuration, or speculative API clients.
- Keep UI consumption behind a replaceable catalog repository interface.
- Support keyboard interaction, visible focus, Escape-to-close dialogs, and reduced motion.
- Verify mobile, tablet, and desktop layouts and require a clean production build and console.

---

## File Map

- `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`: minimal Vite/React toolchain.
- `public/paki/`: copied logo and 12 product WebP files.
- `src/domain/catalog.ts`: stable product/category contracts, including preserved B2B metadata.
- `src/data/paki-catalog.ts`: the local Paki catalog records.
- `src/data/catalog-repository.ts`: repository interface and local adapter.
- `src/services/catalog.ts`: pure search/filter behavior.
- `src/services/cart.ts`: pure cart update and subtotal behavior.
- `src/components/*.tsx`: header, hero, categories, product card/grid, quick view, cart drawer, value strip, promotion, and footer.
- `src/App.tsx`: page composition and top-level interaction state.
- `src/styles.css`: tokens, responsive composition, animation, and component styling.
- `src/services/*.test.ts`: focused service tests.

### Task 1: Scaffold the app and lock catalog/cart contracts

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `src/domain/catalog.ts`
- Create: `src/services/catalog.test.ts`
- Create: `src/services/cart.test.ts`

**Interfaces:**
- Produces: `Product`, `Category`, `CartLine`, `filterProducts(products, query, category)`, `addCartItem(lines, product)`, `changeCartQuantity(lines, productId, delta)`, `cartSubtotal(lines)`.

- [ ] **Step 1: Add the Vite/React toolchain**

Create scripts for `dev`, `build`, `test`, and `preview`; use React 19, Vite 7, TypeScript 5, and Vitest. Configure the production build as `tsc -b && vite build` and Vitest with a browser-like `jsdom` environment only if component tests need it later.

- [ ] **Step 2: Define stable domain contracts**

```ts
export type Category = {
  name: string
  handle: string
  accent: "red" | "blue" | "yellow" | "green" | "sky"
}

export type Product = {
  id: string
  handle: string
  title: string
  category: string
  description: string
  image: string
  price: number
  age: string
  ref: string
  ean: string
  dun: string
  masterQuantity: number
  productDimensions: string
  masterDimensions: string
  weightKg: string
  cubage: string
  badge?: string
}

export type CartLine = { product: Product; quantity: number }
```

- [ ] **Step 3: Write failing catalog and cart tests**

```ts
expect(filterProducts(products, "dino", "all")).toEqual([products[0]])
expect(filterProducts(products, "", "jogos")).toEqual([products[1]])
expect(filterProducts(products, "xyz", "all")).toEqual([])

expect(addCartItem([], products[0])).toEqual([{ product: products[0], quantity: 1 }])
expect(addCartItem([{ product: products[0], quantity: 1 }], products[0])[0].quantity).toBe(2)
expect(changeCartQuantity([{ product: products[0], quantity: 1 }], products[0].id, -1)).toEqual([])
expect(cartSubtotal([{ product: products[0], quantity: 2 }])).toBe(products[0].price * 2)
```

- [ ] **Step 4: Run the tests and confirm the intended failure**

Run: `npm install && npm test -- --run`

Expected: tests fail because `src/services/catalog.ts` and `src/services/cart.ts` do not exist.

- [ ] **Step 5: Commit the failing contract tests**

Run: `git add package.json package-lock.json vite.config.ts tsconfig*.json index.html src/domain src/services && git commit -m "test: define storefront domain behavior"`

### Task 2: Implement the catalog adapter and cart services

**Files:**
- Create: `public/paki/logo.webp`
- Create: `public/paki/products/*.webp`
- Create: `src/data/paki-catalog.ts`
- Create: `src/data/catalog-repository.ts`
- Create: `src/services/catalog.ts`
- Create: `src/services/cart.ts`
- Modify: `src/services/catalog.test.ts`
- Modify: `src/services/cart.test.ts`

**Interfaces:**
- Consumes: domain contracts from Task 1.
- Produces: `CatalogRepository`, `localCatalogRepository`, `pakiCategories`, `pakiProducts`, and passing service functions.

- [ ] **Step 1: Copy the reference assets locally**

Copy `apps/storefront/public/paki/logo.webp` and `apps/storefront/public/paki/products/*.webp` from the temporary clone of `adrianmircus/pakitoys-medusa-b2b` into `public/paki/`. Confirm exactly one logo and 12 product images are present.

- [ ] **Step 2: Transcribe all catalog records**

Create `pakiCategories` and `pakiProducts` using the 12 records in the reference repository. Preserve every B2B field from `PakiProduct`, add concise customer-facing descriptions, and use the reference seed's category price mapping as demo unit prices.

- [ ] **Step 3: Implement the repository boundary**

```ts
export interface CatalogRepository {
  listProducts(): Promise<Product[]>
  listCategories(): Promise<Category[]>
  getProduct(handle: string): Promise<Product | undefined>
}

export const localCatalogRepository: CatalogRepository = {
  async listProducts() { return pakiProducts },
  async listCategories() { return pakiCategories },
  async getProduct(handle) { return pakiProducts.find((product) => product.handle === handle) },
}
```

- [ ] **Step 4: Implement the minimum pure services**

`filterProducts` lowercases and trims the query, matches title/category/description, then applies the category handle unless it is `all`. Cart updates must be immutable, merge duplicate items, remove a line when quantity reaches zero, and calculate `price * quantity` totals.

- [ ] **Step 5: Run focused tests**

Run: `npm test -- --run src/services/catalog.test.ts src/services/cart.test.ts`

Expected: all catalog and cart tests pass.

- [ ] **Step 6: Commit the data boundary**

Run: `git add public/paki src/data src/services && git commit -m "feat: add Paki catalog and cart services"`

### Task 3: Build the accessible interactive storefront

**Files:**
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/components/icons.tsx`
- Create: `src/components/header.tsx`
- Create: `src/components/hero.tsx`
- Create: `src/components/category-rail.tsx`
- Create: `src/components/product-card.tsx`
- Create: `src/components/product-grid.tsx`
- Create: `src/components/quick-view.tsx`
- Create: `src/components/cart-drawer.tsx`
- Create: `src/components/value-strip.tsx`
- Create: `src/components/promotion.tsx`
- Create: `src/components/footer.tsx`

**Interfaces:**
- Consumes: `CatalogRepository`, `Product`, `Category`, `CartLine`, and all pure service functions.
- Produces: a single-page storefront with working search, filter, favorite, quick-view, and cart flows.

- [ ] **Step 1: Compose the data-driven application state**

`App` loads catalog data once from `localCatalogRepository`, tracks `query`, `activeCategory`, `favorites`, `quickViewProduct`, `cartLines`, `cartOpen`, and `mobileMenuOpen`, and derives visible products with `filterProducts`.

- [ ] **Step 2: Implement the navigation and discovery surface**

The header contains the Paki logo, anchored navigation, an expanding labeled search input, favorite count, cart quantity badge, and accessible mobile menu. Hero and category controls scroll to `#produtos`; category buttons update `activeCategory` and expose `aria-pressed`.

- [ ] **Step 3: Implement cards and empty state**

Each product card displays the local WebP, category, title, age, BRL-formatted price, favorite button, quick-view button, and add-to-cart button. The product grid displays a friendly “Nenhum brinquedo encontrado” message with a reset control when empty.

- [ ] **Step 4: Implement dialogs**

Quick view and cart drawer use `role="dialog"`, `aria-modal="true"`, labeled headings, overlay click close, explicit close buttons, Escape close, and body-scroll locking. Quick view exposes age and product reference; the cart supports increase, decrease, remove, subtotal, and a disabled “Finalizar compra — demonstração” button.

- [ ] **Step 5: Complete the storytelling sections**

Add the learning/imagination/motor-development value strip, a bold Paki-blue promotion section, newsletter input with a non-transmitting demo acknowledgement, and a multi-column footer with catalog, institutional, and contact links.

- [ ] **Step 6: Verify TypeScript before styling**

Run: `npm run build`

Expected: TypeScript and Vite complete without errors; the interface is structurally usable but not yet visually finished.

- [ ] **Step 7: Commit the functional UI**

Run: `git add src && git commit -m "feat: build interactive Paki storefront"`

### Task 4: Apply the presentation-ready visual system

**Files:**
- Create: `src/styles.css`
- Modify: component files only where a styling hook or semantic wrapper is required.

**Interfaces:**
- Consumes: semantic component structure from Task 3.
- Produces: the approved navy/red/cream visual language at mobile, tablet, and desktop widths.

- [ ] **Step 1: Create design tokens and base behavior**

Define CSS variables for Paki navy `#1f2f96`, red `#ed1c2e`, warm cream `#fff8e8`, yellow `#ffd93d`, sky `#dff3ff`, ink `#182044`, white, borders, radii, shadows, and transition curves. Use Fredoka from Google Fonts with a rounded local fallback and ensure text remains readable if the network font is unavailable.

- [ ] **Step 2: Build the signature composition**

Style an editorial split hero with oversized type, orbital toy cards, sticker labels, decorative dots/stars, controlled overlap, and a subtle grain/pattern layer. Product cards use calm white surfaces so the colorful packaging remains the focal point.

- [ ] **Step 3: Add responsive rules**

Use a 1200–1320px content width, a four-column desktop product grid, two-column tablet grid, and one-column mobile layout. Collapse desktop navigation below 900px, avoid horizontal overflow, keep touch targets at least 44px, and make dialogs full-width/full-height appropriate on narrow screens.

- [ ] **Step 4: Add purposeful motion**

Apply a staggered hero entrance, gentle product hover lift, rotating decorative orbit, and drawer/modal transitions. Disable nonessential animation inside `@media (prefers-reduced-motion: reduce)`.

- [ ] **Step 5: Run build and tests**

Run: `npm test -- --run && npm run build`

Expected: all tests pass and the production bundle builds successfully.

- [ ] **Step 6: Commit the visual system**

Run: `git add src && git commit -m "style: polish Paki storefront presentation"`

### Task 5: Browser verification and final fixes

**Files:**
- Modify: only files directly implicated by verification findings.

**Interfaces:**
- Consumes: the production-ready app.
- Produces: verified desktop/mobile presentation and interaction evidence.

- [ ] **Step 1: Start the app and inspect desktop layout**

Run: `npm run dev -- --host 127.0.0.1`

Verify at a desktop viewport: hero hierarchy, all local images, category filter, search, empty reset, favorite count, quick view, add-to-cart, quantity changes, removal, subtotal, newsletter acknowledgement, and footer.

- [ ] **Step 2: Inspect responsive behavior**

Verify at approximately 768px and 390px widths: mobile menu, no horizontal overflow, readable hero, correctly stacked cards, usable dialogs/drawer, and 44px controls.

- [ ] **Step 3: Inspect accessibility and console signals**

Verify keyboard traversal, visible focus, Escape-to-close, dialog labels, reduced-motion behavior, missing image requests, and browser console errors.

- [ ] **Step 4: Apply only evidence-based fixes**

For each issue, reproduce it, change the smallest responsible file, re-run the affected interaction, and then repeat `npm test -- --run && npm run build`.

- [ ] **Step 5: Final verification commit**

Run: `git add -A && git commit -m "fix: complete storefront verification"` only if verification required code changes. If no changes are needed, leave the working tree clean and do not create an empty commit.
