# Paki Toys Stakeholder Demo Realism Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a realistic, clearly simulated retailer-pricing, availability, minimum-order, freight, commercial-support, and proposal-attribution layer to the existing Paki Toys wholesale demo.

**Architecture:** Centralize every illustrative commercial value in a `DemoCommercialPolicy`, calculate commercial results through pure services, and snapshot those results into saved orders. Product, cart, checkout, and order components consume calculated view data so a future Medusa adapter can replace pricing, inventory, fulfillment, and customer inputs without redesigning the UI.

**Tech Stack:** React 19, TypeScript 5.8, Vite 7, Vitest 3, browser `localStorage`, CSS.

## Global Constraints

- The audience is Paki Toys leadership evaluating NoctiLabs as the implementation partner.
- Paki remains the dominant brand; NoctiLabs appears only as `Conceito digital por NoctiLabs` in the footer.
- All stock, discounts, minimums, freight, delivery dates, customer data, and commercial support are explicitly demonstration data.
- Minimum merchandise order is R$ 1.500,00 and does not block checkout.
- Volume discounts are 0% for 1–2 cartons, 5% for 3–5 cartons, and 8% for 6+ cartons per product line.
- Freight choices are R$ 189 / 5–7 business days, R$ 329 / 2–3 business days, and free scheduled pickup / approximately 2 business days.
- No live order, payment, inventory reservation, freight quote, email, WhatsApp, CRM action, or personal Paki employee identity.
- Do not add authentication, Medusa client, mock server, PDF library, router, or new UI framework.
- Preserve all 12 current products and assets.
- Reorder recalculates the current policy rather than reusing historical commercial values.
- Follow red-green-refactor for every new business function.

---

## File Structure

- Create `src/domain/commercial.ts`: commercial-policy, pricing, availability, freight, and retailer types.
- Create `src/data/demo-commercial-policy.ts`: all fixed illustrative configuration and example-order/product availability data.
- Create `src/services/commercial.ts`: pure policy calculations and demo-data builders.
- Create `src/services/commercial.test.ts`: policy, pricing, minimum, availability, freight, example-order, and profile tests.
- Create `src/components/commercial-badges.tsx`: availability and retailer-tier badges.
- Create `src/components/volume-tier-table.tsx`: threshold table with active tier.
- Create `src/components/minimum-order-progress.tsx`: below/reached progress states.
- Create `src/components/freight-options.tsx`: accessible freight selection.
- Create `src/components/commercial-support-card.tsx`: non-sending inline support interaction.
- Modify `src/domain/checkout.ts`: commercial and freight snapshots.
- Modify `src/services/checkout.ts` and `src/services/checkout.test.ts`: freight validation and commercial order creation.
- Modify `src/components/product-card.tsx`, `src/components/quick-view.tsx`, `src/components/cart-drawer.tsx`, `src/components/checkout.tsx`, `src/components/order-summary.tsx`, `src/components/order-confirmation.tsx`, `src/components/order-history.tsx`, `src/components/order-detail.tsx`, and `src/components/footer.tsx`.
- Modify `src/App.tsx`: commercial calculations, example order, retailer autofill, and freight state.
- Modify `src/styles.css`: native Paki styling, responsive states, reduced motion, and print output.

---

### Task 1: Commercial policy domain and pure calculations

**Files:**
- Create: `src/domain/commercial.ts`
- Create: `src/data/demo-commercial-policy.ts`
- Create: `src/services/commercial.ts`
- Create: `src/services/commercial.test.ts`

**Interfaces:**
- Produces: `DemoCommercialPolicy`, `CommercialTier`, `VolumePricingTier`, `FreightOption`, `CommercialLinePricing`, `CommercialOrderTotals`, and `MinimumOrderProgress`.
- Produces: `getVolumeTier`, `priceCommercialLine`, `calculateCommercialTotals`, `calculateMinimumProgress`, `getProductAvailability`, `isAvailabilityUnderReview`, `buildExampleCart`, `getDemoRetailerDraft`, and `getFreightOption`.

- [ ] **Step 1: Write failing tier, line-pricing, and money-rounding tests**

Create `src/services/commercial.test.ts` with a six-unit carton product priced at R$ 10,00 and assert:

```ts
expect(getVolumeTier(1).discountRate).toBe(0)
expect(getVolumeTier(2).discountRate).toBe(0)
expect(getVolumeTier(3).discountRate).toBe(0.05)
expect(getVolumeTier(5).discountRate).toBe(0.05)
expect(getVolumeTier(6).discountRate).toBe(0.08)

expect(priceCommercialLine({ product, quantity: 3 })).toMatchObject({
  listValue: 180,
  discountRate: 0.05,
  savings: 9,
  netSubtotal: 171,
})
```

Use a R$ 19,99 product to prove values are rounded to two decimal places at line level.

- [ ] **Step 2: Run the targeted tests and confirm RED**

Run: `npm test -- --run src/services/commercial.test.ts`

Expected: FAIL because the commercial modules do not exist.

- [ ] **Step 3: Define the commercial types**

Add these core definitions to `src/domain/commercial.ts`:

```ts
import type { CompanyDetails, DeliveryAddress } from "./checkout"

export type CommercialTier = "gold"

export type VolumePricingTier = {
  minBoxes: number
  maxBoxes?: number
  discountRate: number
  label: string
}

export type ProductAvailability = {
  productId: string
  availableBoxes: number
}

export type DemoRetailerProfile = {
  company: CompanyDetails
  delivery: DeliveryAddress
  commercialTier: CommercialTier
}

export type FreightOption = {
  id: "economy" | "express" | "pickup"
  title: string
  price: number
  estimate: string
  description: string
}

export type DemoCommercialPolicy = {
  minimumOrder: number
  tiers: VolumePricingTier[]
  availability: Record<string, number>
  freightOptions: FreightOption[]
  exampleOrder: Array<{ productId: string; boxCount: number }>
  retailerProfile: DemoRetailerProfile
}

export type CommercialLinePricing = {
  productId: string
  listValue: number
  discountRate: number
  discountLabel: string
  savings: number
  netSubtotal: number
  availableBoxes?: number
  availabilityUnderReview: boolean
}

export type CommercialOrderTotals = {
  listValue: number
  savings: number
  merchandiseSubtotal: number
  freightTotal: number
  estimatedTotal: number
}

export type MinimumOrderProgress = {
  minimum: number
  current: number
  remaining: number
  ratio: number
  reached: boolean
}
```

- [ ] **Step 4: Add the centralized demonstration policy**

Create `demoCommercialPolicy` with:

```ts
export const demoCommercialPolicy: DemoCommercialPolicy = {
  minimumOrder: 1500,
  tiers: [
    { minBoxes: 1, maxBoxes: 2, discountRate: 0, label: "Preço Parceiro" },
    { minBoxes: 3, maxBoxes: 5, discountRate: 0.05, label: "Volume 5%" },
    { minBoxes: 6, discountRate: 0.08, label: "Volume 8%" },
  ],
  availability: {
    "2082": 18, "4115": 24, "1501": 20, "1544": 36,
    "3055": 14, "4001": 22, "4100": 16, "4016": 19,
    "1281": 28, "1214": 12, "3092": 15, "1504": 21,
  },
  freightOptions: [
    { id: "economy", title: "Transportadora econômica", price: 189, estimate: "5–7 dias úteis", description: "Melhor equilíbrio entre prazo e custo." },
    { id: "express", title: "Transportadora expressa", price: 329, estimate: "2–3 dias úteis", description: "Prioridade para reposições urgentes." },
    { id: "pickup", title: "Retirada programada", price: 0, estimate: "Cerca de 2 dias úteis", description: "Retirada após confirmação da equipe Paki." },
  ],
  exampleOrder: [
    { productId: "1214", boxCount: 3 },
    { productId: "1544", boxCount: 3 },
    { productId: "4115", boxCount: 2 },
  ],
  retailerProfile: {
    company: {
      cnpj: "11.222.333/0001-81",
      legalName: "Brinquedos Aurora Comércio Demonstrativo Ltda.",
      tradeName: "Aurora Kids · Empresa de demonstração",
      stateRegistration: "ISENTO",
      buyerName: "Comprador de demonstração",
      email: "compras@example.com",
      phone: "(11) 99999-0000",
    },
    delivery: {
      postalCode: "01310-100",
      street: "Avenida Paulista",
      number: "1000",
      complement: "Loja demonstrativa",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      contactName: "Recebimento de demonstração",
      instructions: "Entregar pela entrada comercial.",
    },
    commercialTier: "gold",
  },
}
```

`getDemoRetailerDraft()` clones this profile and adds `paymentTerm: ""` and `freightOptionId: ""`; do not introduce real contact details.

- [ ] **Step 5: Implement tier and pricing functions**

Use a single cents helper:

```ts
const money = (value: number) => Math.round(value * 100) / 100

export function getVolumeTier(boxCount: number) {
  return demoCommercialPolicy.tiers.find((tier) =>
    boxCount >= tier.minBoxes && (tier.maxBoxes === undefined || boxCount <= tier.maxBoxes),
  ) ?? demoCommercialPolicy.tiers[0]
}

export function priceCommercialLine(line: CartLine): CommercialLinePricing {
  const listValue = money(line.product.price * line.product.masterQuantity * line.quantity)
  const tier = getVolumeTier(line.quantity)
  const savings = money(listValue * tier.discountRate)
  const availableBoxes = demoCommercialPolicy.availability[line.product.id]
  return {
    productId: line.product.id,
    listValue,
    discountRate: tier.discountRate,
    discountLabel: tier.label,
    savings,
    netSubtotal: money(listValue - savings),
    availableBoxes,
    availabilityUnderReview: availableBoxes === undefined || line.quantity > availableBoxes,
  }
}
```

- [ ] **Step 6: Verify tier and pricing GREEN**

Run: `npm test -- --run src/services/commercial.test.ts`

Expected: tier and line-pricing tests pass.

- [ ] **Step 7: Add failing aggregate, minimum, availability, freight, preset, and retailer tests**

Assert:

```ts
expect(calculateMinimumProgress(1200)).toEqual({ minimum: 1500, current: 1200, remaining: 300, ratio: 0.8, reached: false })
expect(calculateMinimumProgress(1750)).toEqual({ minimum: 1500, current: 1750, remaining: 0, ratio: 1, reached: true })
expect(isAvailabilityUnderReview("1214", 12)).toBe(false)
expect(isAvailabilityUnderReview("1214", 13)).toBe(true)
expect(getFreightOption("express")?.price).toBe(329)
expect(buildExampleCart(products).lines).toHaveLength(3)
expect(buildExampleCart(products).missingProductIds).toEqual([])
expect(getDemoRetailerDraft().commercialTier).toBe("gold")
```

Also assert freight changes only `freightTotal` and `estimatedTotal`, and that an unavailable preset product is reported and skipped.

- [ ] **Step 8: Run the targeted tests and confirm RED**

Run: `npm test -- --run src/services/commercial.test.ts`

Expected: FAIL because the aggregate and demo-builder exports are missing.

- [ ] **Step 9: Implement aggregate and demo-builder functions**

Implement the remaining functions with these signatures and calculations:

```ts
export function calculateCommercialTotals(
  lines: CartLine[],
  freightOptionId: FreightOption["id"] | "" = "",
): CommercialOrderTotals {
  const priced = lines.map(priceCommercialLine)
  const listValue = money(priced.reduce((total, line) => total + line.listValue, 0))
  const savings = money(priced.reduce((total, line) => total + line.savings, 0))
  const merchandiseSubtotal = money(priced.reduce((total, line) => total + line.netSubtotal, 0))
  const freightTotal = getFreightOption(freightOptionId)?.price ?? 0
  return {
    listValue,
    savings,
    merchandiseSubtotal,
    freightTotal,
    estimatedTotal: money(merchandiseSubtotal + freightTotal),
  }
}

export function calculateMinimumProgress(current: number): MinimumOrderProgress {
  const minimum = demoCommercialPolicy.minimumOrder
  const roundedCurrent = money(current)
  return {
    minimum,
    current: roundedCurrent,
    remaining: money(Math.max(0, minimum - roundedCurrent)),
    ratio: Math.min(1, roundedCurrent / minimum),
    reached: roundedCurrent >= minimum,
  }
}

export function getProductAvailability(productId: string) {
  return demoCommercialPolicy.availability[productId]
}

export function isAvailabilityUnderReview(productId: string, boxCount: number) {
  const available = getProductAvailability(productId)
  return available === undefined || boxCount > available
}

export function getFreightOption(id: FreightOption["id"] | "") {
  return demoCommercialPolicy.freightOptions.find((option) => option.id === id)
}

export function buildExampleCart(products: Product[]) {
  const byId = new Map(products.map((product) => [product.id, product]))
  const lines: CartLine[] = []
  const missingProductIds: string[] = []
  demoCommercialPolicy.exampleOrder.forEach(({ productId, boxCount }) => {
    const product = byId.get(productId)
    if (product) lines.push({ product, quantity: boxCount })
    else missingProductIds.push(productId)
  })
  return { lines, missingProductIds }
}

export function getDemoRetailerDraft() {
  const profile = demoCommercialPolicy.retailerProfile
  return {
    company: { ...profile.company },
    delivery: { ...profile.delivery },
    commercialTier: profile.commercialTier,
    paymentTerm: "" as const,
    freightOptionId: "" as const,
  }
}
```

- [ ] **Step 10: Run targeted tests, full tests, and build**

Run: `npm test -- --run src/services/commercial.test.ts`, then `npm test -- --run`, then `npm run build`.

Expected: all tests and the production build pass.

- [ ] **Step 11: Commit**

```powershell
git add src/domain/commercial.ts src/data/demo-commercial-policy.ts src/services/commercial.ts src/services/commercial.test.ts
git commit -m "feat: add demo commercial policy"
```

---

### Task 2: Product availability and volume-pricing surfaces

**Files:**
- Create: `src/components/commercial-badges.tsx`
- Create: `src/components/volume-tier-table.tsx`
- Modify: `src/components/product-card.tsx`
- Modify: `src/components/product-grid.tsx`
- Modify: `src/components/quick-view.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `priceCommercialLine`, `getProductAvailability`, and the configured tiers.
- Produces: `AvailabilityBadge`, `RetailerTierBadge`, and `VolumeTierTable`.

- [ ] **Step 1: Add a failing availability fallback test**

Assert an unknown product ID returns no fixed count and resolves to an under-review state rather than throwing.

- [ ] **Step 2: Run RED, implement the fallback, and verify GREEN**

Run `npm test -- --run src/services/commercial.test.ts`, implement `getProductAvailability(productId): number | undefined`, and rerun until passing.

- [ ] **Step 3: Create reusable commercial badges**

`AvailabilityBadge` accepts `{ availableBoxes?: number; underReview?: boolean; demoLabel?: boolean }` and renders either `N caixas disponíveis` or `Disponibilidade sob consulta`, plus visually hidden `Dados de demonstração` context. `RetailerTierBadge` renders `Parceiro Ouro` with a gold treatment and the same demo context.

- [ ] **Step 4: Create the volume tier table**

Render all three configured tiers as an accessible `<table>` with columns `Caixas` and `Condição`. Mark the active row with text `Condição atual`; do not rely on color alone.

- [ ] **Step 5: Add product-card commercial context**

Pass availability from `App` through `ProductGrid` into `ProductCard`. Add `Preço Parceiro` beside the existing unit price and an `AvailabilityBadge` below product metadata. Do not add the tier table to the card.

- [ ] **Step 6: Expand quick view**

Show partner unit price, price per carton, availability, configured tier table, and an example savings line for the quantity being added. Preserve existing product facts and add-to-cart behavior.

- [ ] **Step 7: Add responsive styles**

Add focused `.commercial-label`, `.availability-badge`, `.retailer-tier`, and `.volume-tier-table` styles. Ensure the tier table fits at 320px and that product-card height remains consistent.

- [ ] **Step 8: Run full verification and commit**

Run `npm test -- --run` and `npm run build`, then:

```powershell
git add src/components/commercial-badges.tsx src/components/volume-tier-table.tsx src/components/product-card.tsx src/components/product-grid.tsx src/components/quick-view.tsx src/App.tsx src/styles.css src/services/commercial.test.ts src/services/commercial.ts
git commit -m "feat: show partner pricing and availability"
```

---

### Task 3: Example order, cart savings, and minimum progress

**Files:**
- Create: `src/components/minimum-order-progress.tsx`
- Modify: `src/components/cart-drawer.tsx`
- Modify: `src/components/order-summary.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `src/services/commercial.test.ts`

**Interfaces:**
- Consumes: priced lines, commercial totals, minimum progress, and `buildExampleCart`.
- Produces: `MinimumOrderProgressView` and `onLoadExampleOrder` cart behavior.

- [ ] **Step 1: Add failing example-order qualification tests**

Assert the configured example order exceeds R$ 1.500 after discounts, contains at least one discounted line, and stays within every illustrative availability count.

- [ ] **Step 2: Run RED and adjust only policy data if needed**

Run: `npm test -- --run src/services/commercial.test.ts`

Expected: FAIL if the configured preset does not satisfy all presentation constraints. Adjust only example-order quantities, not pricing formulas, until GREEN.

- [ ] **Step 3: Create minimum-order progress**

Render below-minimum copy as `Faltam {currency(remaining)} para o mínimo de demonstração` and reached copy as `Mínimo de demonstração alcançado`. Use `<progress max={minimum} value={Math.min(current, minimum)}>` plus the visible ratio treatment.

- [ ] **Step 4: Expand cart line and summary data**

For each line show list value, active tier, savings, net subtotal, and availability state. Replace the single merchandise subtotal with list value, `Economia por volume`, net merchandise subtotal, cartons, and units. Keep freight outside the cart.

- [ ] **Step 5: Add the example-order action**

Add `onLoadExampleOrder` to `CartDrawerProps`. In the empty state render a dashed secondary button labeled `Carregar pedido de exemplo` with `Dados de demonstração`. In `App`, call `buildExampleCart(products)`, replace cart lines, open the cart, and show any skipped product IDs through the existing storefront notice.

- [ ] **Step 6: Expand live order summary**

Allow `OrderSummary` to accept commercial priced lines and totals. Show list value, savings, merchandise subtotal, freight when selected, and estimated total while preserving existing carton and unit details.

- [ ] **Step 7: Style and verify**

Add progress, savings, crossed-list-value, and dashed demo-action styles with reduced-motion handling. Run `npm test -- --run` and `npm run build`.

- [ ] **Step 8: Commit**

```powershell
git add src/components/minimum-order-progress.tsx src/components/cart-drawer.tsx src/components/order-summary.tsx src/App.tsx src/styles.css src/services/commercial.test.ts src/data/demo-commercial-policy.ts
git commit -m "feat: add guided wholesale cart demo"
```

---

### Task 4: Retailer autofill, freight selection, and commercial support

**Files:**
- Create: `src/components/freight-options.tsx`
- Create: `src/components/commercial-support-card.tsx`
- Modify: `src/domain/checkout.ts`
- Modify: `src/services/checkout.ts`
- Modify: `src/services/checkout.test.ts`
- Modify: `src/components/checkout.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Changes: `CheckoutDraft` gains `commercialTier: CommercialTier` and `freightOptionId: FreightOption["id"] | ""`.
- Changes: `WholesaleOrder` snapshots `commercialTier`, `freight`, commercial line values, and commercial totals.
- Produces: `FreightOptions` and `CommercialSupportCard`.

- [ ] **Step 1: Write failing freight validation and order-snapshot tests**

Assert an empty freight selection blocks review, `express` passes, and a created order snapshots:

```ts
expect(order.commercialTier).toBe("gold")
expect(order.freight).toMatchObject({ id: "express", price: 329 })
expect(order.commercialTotals).toEqual({
  listValue: expectedList,
  savings: expectedSavings,
  merchandiseSubtotal: expectedNet,
  freightTotal: 329,
  estimatedTotal: expectedNet + 329,
})
```

- [ ] **Step 2: Run the checkout tests and confirm RED**

Run: `npm test -- --run src/services/checkout.test.ts`

Expected: FAIL because checkout and order types do not contain commercial or freight data.

- [ ] **Step 3: Extend checkout and order types**

Import commercial types into `src/domain/checkout.ts`. Add `commercialTier: "gold"` and `freightOptionId` to `CheckoutDraft`; add `commercialTier`, `freight`, `commercialTotals`, and commercial values to saved order lines.

- [ ] **Step 4: Implement freight validation and commercial snapshots**

Add `validateFreight(freightOptionId)` returning `{ freightOptionId: "Escolha uma opção de entrega." }` when empty. Update `canSubmitCheckout`, `validateCheckoutStep("delivery")`, and `createWholesaleOrder` to use current policy calculations and selected freight.

- [ ] **Step 5: Verify checkout GREEN**

Run: `npm test -- --run src/services/checkout.test.ts`

Expected: all checkout tests pass.

- [ ] **Step 6: Create accessible freight options**

Render the three configured options as radio-card labels showing title, estimate, price, description, and `Valores e prazos de demonstração`. Use `aria-describedby` for the disclaimer and surface the validation error beneath the group.

- [ ] **Step 7: Add retailer autofill**

In the company step render a dashed `Preencher com empresa de demonstração` button. On click, replace the complete draft with `getDemoRetailerDraft()`, show `RetailerTierBadge`, clear current errors, and announce `Dados de demonstração preenchidos` through a polite live region.

- [ ] **Step 8: Add freight selection to delivery**

Place `FreightOptions` after address fields. Do not allow advancing until both address and freight validate. Update the sticky order summary when selection changes.

- [ ] **Step 9: Add commercial support card**

Render `Equipe comercial Paki` in checkout review and order detail. Its button toggles an inline message: `Em uma implementação real, sua solicitação seria encaminhada ao representante responsável pela sua conta.` No navigation or external action occurs.

- [ ] **Step 10: Style, verify, and commit**

Run `npm test -- --run` and `npm run build`, then:

```powershell
git add src/components/freight-options.tsx src/components/commercial-support-card.tsx src/domain/checkout.ts src/services/checkout.ts src/services/checkout.test.ts src/components/checkout.tsx src/App.tsx src/styles.css
git commit -m "feat: add demo retailer and freight journey"
```

---

### Task 5: Post-order consistency, print summary, attribution, and deployment

**Files:**
- Modify: `src/components/order-confirmation.tsx`
- Modify: `src/components/order-history.tsx`
- Modify: `src/components/order-detail.tsx`
- Modify: `src/components/order-summary.tsx`
- Modify: `src/components/footer.tsx`
- Modify: `src/services/checkout.test.ts`
- Modify: `src/services/commercial.test.ts`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: immutable commercial order snapshots and current-policy reorder.
- Produces: consistent confirmation/history/detail/print totals and discreet NoctiLabs attribution.

- [ ] **Step 1: Add failing snapshot immutability and reorder-recalculation tests**

Create an order, mutate current policy input in a local test fixture, and prove the order's saved line discounts/freight remain unchanged. Prove `restoreOrderCart` returns only product/carton quantities so current commercial policy recalculates when the cart renders.

- [ ] **Step 2: Run RED, implement the minimum snapshot/reorder changes, and verify GREEN**

Run: `npm test -- --run src/services/checkout.test.ts src/services/commercial.test.ts`.

Expected: tests fail until snapshots are fully copied and reorder excludes historical pricing; rerun until both files pass.

- [ ] **Step 3: Expand confirmation and history**

Confirmation shows `Parceiro Ouro`, volume savings, selected freight, estimated total, and `Baixar / imprimir resumo`. History cards show estimated total and freight title while preserving received status.

- [ ] **Step 4: Expand order detail and print**

Detail shows retailer tier, each saved line's list value/discount/savings/net subtotal, selected freight, commercial totals, and support card. The download action calls `window.print()`. Print CSS retains Paki identity, all commercial values, reference, freight, and the demo disclaimer.

- [ ] **Step 5: Add the footer attribution**

In `Footer`, add exactly one secondary line: `Conceito digital por NoctiLabs`. It uses existing footer typography at reduced size and does not link externally. Hide it in `@media print`.

- [ ] **Step 6: Run final local verification**

Run:

```powershell
npm test -- --run
npm run build
git diff --check
git status --short
```

Expected: zero test failures, successful build, no whitespace errors, and only intended feature files plus the pre-existing uncommitted `.gitignore` change.

- [ ] **Step 7: Commit final feature work**

```powershell
git add src/components/order-confirmation.tsx src/components/order-history.tsx src/components/order-detail.tsx src/components/order-summary.tsx src/components/footer.tsx src/services/checkout.test.ts src/services/commercial.test.ts src/styles.css
git commit -m "feat: complete stakeholder demo story"
```

- [ ] **Step 8: Integrate and deploy**

Fast-forward the feature branch into `master`, rerun all tests and the build on the merged tree, push `master` to `origin`, and wait for NoctiLabs Vercel production status `Ready`.

- [ ] **Step 9: Verify production without visual computer testing**

Confirm:

- `https://paki-toys.vercel.app` returns HTTP 200.
- The production bundle contains `Preço Parceiro`, `Carregar pedido de exemplo`, `Transportadora econômica`, `Parceiro Ouro`, and `Conceito digital por NoctiLabs`.
- All 12 `/paki/products/*.webp` assets return HTTP 200.
- GitHub `master` equals local `HEAD`.
