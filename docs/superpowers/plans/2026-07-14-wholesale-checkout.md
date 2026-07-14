# Paki Toys Wholesale Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a complete simulated wholesale checkout, order confirmation, order history, tracking, print, and reorder journey for Paki Toys.

**Architecture:** Keep the existing dependency-light React/Vite SPA and add explicit app view state. Put wholesale calculations and validation in pure services, persist immutable order snapshots through a `CheckoutRepository`, and keep components focused so a future Medusa adapter can replace local persistence without changing the UI flow.

**Tech Stack:** React 19, TypeScript 5.8, Vite 7, Vitest 3, browser `localStorage`, CSS.

## Global Constraints

- Checkout targets Brazilian retailers and wholesale buyers.
- Cart quantities represent master cartons and use `Product.masterQuantity` as units per carton.
- `Product.price` remains the per-unit demo price; freight is excluded and marked pending.
- Submission is simulated locally and must never imply a live order, payment, credit approval, or freight quote.
- Do not collect card or bank credentials.
- Do not add a router, authentication, Medusa client, CEP API, freight API, or payment SDK.
- Preserve the existing Paki visual language and support 320px through desktop layouts.
- All new business behavior follows red-green-refactor and is covered by Vitest.

---

## File Structure

- Create `src/domain/checkout.ts`: checkout and immutable order types.
- Modify `src/services/cart.ts`: carton/unit/wholesale total calculations.
- Modify `src/services/cart.test.ts`: wholesale cart behavior.
- Create `src/services/checkout.ts`: normalization, validation, order creation, status timeline, and reorder mapping.
- Create `src/services/checkout.test.ts`: pure checkout behavior.
- Create `src/data/order-repository.ts`: repository contract and local-storage adapter.
- Create `src/data/order-repository.test.ts`: persistence behavior.
- Modify `src/components/cart-drawer.tsx`: case-based cart and enabled checkout action.
- Create `src/components/checkout.tsx`: four-step checkout shell and forms.
- Create `src/components/order-summary.tsx`: reusable order-line and totals presentation.
- Create `src/components/order-confirmation.tsx`: submission confirmation.
- Create `src/components/order-history.tsx`: saved order list.
- Create `src/components/order-detail.tsx`: order snapshot, timeline, print, and reorder.
- Modify `src/components/header.tsx`: order-history navigation.
- Modify `src/App.tsx`: app-view orchestration and repository data flow.
- Modify `src/styles.css`: responsive checkout, order, validation, status, and print styles.

---

### Task 1: Wholesale cart calculations and cart presentation

**Files:**
- Modify: `src/services/cart.ts`
- Modify: `src/services/cart.test.ts`
- Modify: `src/components/cart-drawer.tsx`

**Interfaces:**
- Produces: `cartBoxCount(lines): number`, `cartUnitCount(lines): number`, `cartSubtotal(lines): number`, `cartLineSubtotal(line): number`.
- Changes: `CartLine.quantity` continues to exist but is presented and interpreted as carton count.

- [ ] **Step 1: Write failing wholesale cart tests**

Add tests proving one carton uses `masterQuantity`, two cartons multiply total units and subtotal, and the aggregate box count remains the sum of cart quantities:

```ts
it("calculates wholesale cartons, units, and merchandise subtotal", () => {
  const cart = [{ product: { ...product, price: 10, masterQuantity: 6 }, quantity: 2 }]
  expect(cartBoxCount(cart)).toBe(2)
  expect(cartUnitCount(cart)).toBe(12)
  expect(cartLineSubtotal(cart[0])).toBe(120)
  expect(cartSubtotal(cart)).toBe(120)
})
```

- [ ] **Step 2: Run the targeted test and confirm RED**

Run: `npm test -- --run src/services/cart.test.ts`

Expected: FAIL because `cartBoxCount`, `cartUnitCount`, and `cartLineSubtotal` are not exported and the old subtotal ignores carton size.

- [ ] **Step 3: Implement the minimal wholesale calculations**

Use these implementations:

```ts
export function cartBoxCount(lines: CartLine[]) {
  return lines.reduce((total, line) => total + line.quantity, 0)
}

export function cartUnitCount(lines: CartLine[]) {
  return lines.reduce((total, line) => total + line.quantity * line.product.masterQuantity, 0)
}

export function cartLineSubtotal(line: CartLine) {
  return line.product.price * line.product.masterQuantity * line.quantity
}

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce((total, line) => total + cartLineSubtotal(line), 0)
}
```

Keep `cartItemCount` as a compatibility alias to `cartBoxCount` until `App` is updated.

- [ ] **Step 4: Update the cart drawer**

Add `boxCount`, `unitCount`, and `onCheckout` props. Show `Preço/un.`, `Unidades/caixa`, `Caixas`, `Total de unidades`, and each line subtotal. Replace the disabled button with:

```tsx
<button className="button button--red button--full" type="button" onClick={onCheckout}>
  Continuar para o pedido
</button>
```

- [ ] **Step 5: Run tests and build**

Run: `npm test -- --run src/services/cart.test.ts && npm run build`

Expected: wholesale cart tests pass and the production build exits 0.

- [ ] **Step 6: Commit**

```powershell
git add src/services/cart.ts src/services/cart.test.ts src/components/cart-drawer.tsx
git commit -m "feat: make cart quantities wholesale cases"
```

---

### Task 2: Checkout domain, validation, order creation, and persistence

**Files:**
- Create: `src/domain/checkout.ts`
- Create: `src/services/checkout.ts`
- Create: `src/services/checkout.test.ts`
- Create: `src/data/order-repository.ts`
- Create: `src/data/order-repository.test.ts`

**Interfaces:**
- Produces: `CompanyDetails`, `DeliveryAddress`, `PaymentTerm`, `CheckoutDraft`, `WholesaleOrderLine`, `WholesaleOrderStatus`, `WholesaleOrder`, and `OrderTotals`.
- Produces: `normalizeDigits`, `isValidCnpj`, `validateCompany`, `validateDelivery`, `validateTerms`, `createWholesaleOrder`, `orderStatusSteps`, and `restoreOrderCart`.
- Produces: `CheckoutRepository` and `LocalOrderRepository`.

- [ ] **Step 1: Define wished-for behavior in failing service tests**

Cover a valid CNPJ (`11.222.333/0001-81`), invalid repeated/checksum CNPJs, CEP, phone, email, UF, required fields, totals, immutable snapshots, reference format `/^PK-[A-Z0-9]{8}$/`, ordered status steps, and reordering with missing product IDs.

Core assertions:

```ts
expect(isValidCnpj("11.222.333/0001-81")).toBe(true)
expect(isValidCnpj("11.111.111/1111-11")).toBe(false)
expect(validateDelivery(validDelivery)).toEqual({})
expect(order.status).toBe("received")
expect(order.reference).toMatch(/^PK-[A-Z0-9]{8}$/)
expect(order.lines[0].boxCount).toBe(2)
expect(order.lines[0].totalUnits).toBe(12)
```

- [ ] **Step 2: Run the service tests and confirm RED**

Run: `npm test -- --run src/services/checkout.test.ts`

Expected: FAIL because the checkout domain and service do not exist.

- [ ] **Step 3: Add the checkout domain types**

Define exact unions and records:

```ts
export type PaymentTerm = "pix" | "boleto-28" | "commercial"
export type WholesaleOrderStatus = "received" | "commercial-review" | "freight-confirmed" | "approved" | "invoiced" | "shipped"
export type FieldErrors<T> = Partial<Record<keyof T, string>>
```

`WholesaleOrderLine` stores product snapshot data plus `unitPrice`, `unitsPerBox`, `boxCount`, `totalUnits`, and `lineSubtotal`. `WholesaleOrder` stores `id`, `reference`, `createdAt`, `status`, the checkout records, lines, totals, and `freightStatus: "pending"`.

- [ ] **Step 4: Implement pure validation and order services**

Normalize digits before validation. Implement both official CNPJ check digits, reject repeated digits, validate CEP as eight digits, phone as 10 or 11 digits, email with `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, and UF with `/^[A-Z]{2}$/`.

Create orders only after cart and form validation. Use `crypto.randomUUID()` when available for IDs and a timestamp/random uppercase token for the human reference. Clone product snapshot fields rather than retaining product object references.

- [ ] **Step 5: Verify service GREEN**

Run: `npm test -- --run src/services/checkout.test.ts`

Expected: all checkout service tests pass.

- [ ] **Step 6: Write failing repository tests**

Use an in-memory `Storage` test double. Prove place/list/get, newest-first ordering, malformed JSON recovery to an empty list, and propagation of write failures.

```ts
await repository.placeOrder(order)
expect(await repository.getOrder(order.id)).toEqual(order)
expect(await repository.listOrders()).toEqual([order])
```

- [ ] **Step 7: Run repository tests and confirm RED**

Run: `npm test -- --run src/data/order-repository.test.ts`

Expected: FAIL because `LocalOrderRepository` does not exist.

- [ ] **Step 8: Implement repository contract and local adapter**

Use key `paki-wholesale-orders:v1`, constructor injection `constructor(storage: Storage)`, immutable array updates, newest-first list ordering, `null` for unknown IDs, and an empty list for absent or malformed stored data. Do not swallow `setItem` failures.

- [ ] **Step 9: Run targeted and full tests**

Run: `npm test -- --run src/services/checkout.test.ts src/data/order-repository.test.ts && npm test -- --run`

Expected: all tests pass with zero failures.

- [ ] **Step 10: Commit**

```powershell
git add src/domain/checkout.ts src/services/checkout.ts src/services/checkout.test.ts src/data/order-repository.ts src/data/order-repository.test.ts
git commit -m "feat: add wholesale order domain and repository"
```

---

### Task 3: Four-step checkout UI and app orchestration

**Files:**
- Create: `src/components/order-summary.tsx`
- Create: `src/components/checkout.tsx`
- Modify: `src/components/header.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: checkout domain, validation services, cart totals, and `CheckoutRepository.placeOrder`.
- Produces: `Checkout` component with `lines`, `draft`, `submitting`, `submitError`, `onDraftChange`, `onSubmit`, and `onCancel` props.
- Produces: app views `storefront | checkout | confirmation | orders | order-detail`.

- [ ] **Step 1: Add failing checkout-state tests**

Put pure step helpers in `src/services/checkout.ts` and test that steps cannot advance with invalid data and can advance when their section validates. Test `canSubmitCheckout(draft, lines)` returns false for an empty cart or missing term and true for a fully valid draft.

- [ ] **Step 2: Run targeted tests and confirm RED**

Run: `npm test -- --run src/services/checkout.test.ts`

Expected: FAIL because the step helper exports do not exist.

- [ ] **Step 3: Implement the minimal step helpers and verify GREEN**

Implement `validateCheckoutStep(step, draft)` by delegating to the existing section validators and `canSubmitCheckout` by checking cart length plus all error maps.

Run: `npm test -- --run src/services/checkout.test.ts`

Expected: checkout service tests pass.

- [ ] **Step 4: Build the reusable order summary**

Render product snapshot information from either live cart lines or order lines through a small view-model mapping in the component. Show cartons, units per carton, total units, unit price, line total, aggregate cartons/units, merchandise subtotal, and `Frete: A calcular`.

- [ ] **Step 5: Build the checkout shell and steps**

Use a single semantic `<form>` with four visually distinct step panels. Keep form values controlled in `CheckoutDraft`. On next, validate the current section, render inline errors, focus the first invalid field, then advance. On back, retain entered values. On final submit, show `Enviando pedido…`, disable duplicate actions, and display repository errors in an `aria-live="assertive"` region.

- [ ] **Step 6: Wire app state and repository submission**

In `App`, create the repository once, add checkout draft/view/submission state, prevent empty checkout, call `createWholesaleOrder`, persist through `placeOrder`, clear the cart only after persistence succeeds, set the confirmation order, and move to confirmation. Add `Meus pedidos` header navigation without introducing routes.

- [ ] **Step 7: Add responsive checkout styles**

Add `.checkout-page`, `.checkout-shell`, `.checkout-steps`, `.checkout-panel`, `.field-grid`, `.field`, `.field-error`, `.terms-grid`, `.checkout-summary`, and submission/error styles. Desktop uses two columns; below 900px it stacks; below 480px all paired fields become one column.

- [ ] **Step 8: Run full tests and build**

Run: `npm test -- --run && npm run build`

Expected: all tests pass and the build exits 0.

- [ ] **Step 9: Commit**

```powershell
git add src/services/checkout.ts src/services/checkout.test.ts src/components/order-summary.tsx src/components/checkout.tsx src/components/header.tsx src/components/cart-drawer.tsx src/App.tsx src/styles.css
git commit -m "feat: add retailer checkout journey"
```

---

### Task 4: Confirmation, history, detail, status, print, and reorder

**Files:**
- Create: `src/components/order-confirmation.tsx`
- Create: `src/components/order-history.tsx`
- Create: `src/components/order-detail.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `src/services/checkout.test.ts`

**Interfaces:**
- Consumes: saved `WholesaleOrder`, repository list/get, `orderStatusSteps`, and `restoreOrderCart`.
- Produces: confirmation, order list, order detail, print action, and reorder callback.

- [ ] **Step 1: Add failing status and reorder edge-case tests**

Prove the timeline marks only `received` current for a new order, later statuses upcoming, reorder preserves saved carton counts, and missing catalog products are returned in `missingProductTitles` rather than throwing.

- [ ] **Step 2: Run tests and confirm RED**

Run: `npm test -- --run src/services/checkout.test.ts`

Expected: FAIL until the complete timeline and missing-product result shape are implemented.

- [ ] **Step 3: Implement status and reorder behavior, then verify GREEN**

Return timeline entries with `state: "complete" | "current" | "upcoming"`. Return reorder as `{ lines: CartLine[]; missingProductTitles: string[] }`.

Run: `npm test -- --run src/services/checkout.test.ts`

Expected: all checkout service tests pass.

- [ ] **Step 4: Build confirmation and order history**

Confirmation shows reference, received status, company, totals, pending freight, commercial-review copy, demo notice, and actions. History loads through the repository, sorts newest first, renders a useful empty/error state, and opens order details through app state.

- [ ] **Step 5: Build order detail and timeline**

Show all immutable order data and an ordered status list where state is represented by icon, label, and text—not color alone. Provide `Comprar novamente`, `Imprimir resumo`, `Voltar aos pedidos`, and `Continuar comprando` actions.

- [ ] **Step 6: Wire repository reads and reorder in App**

Load orders when history opens. On reorder, map saved IDs to the active catalog, restore valid carton quantities, show a non-blocking skipped-product message when necessary, return to storefront, and open the cart.

- [ ] **Step 7: Add order and print styles**

Add responsive cards, status timeline, confirmation hero, detail sections, banners, and `@media print` rules that hide header/footer/actions and remove decorative shadows/backgrounds while preserving the order document.

- [ ] **Step 8: Run full automated verification**

Run: `npm test -- --run && npm run build`

Expected: all tests pass and the build exits 0.

- [ ] **Step 9: Commit**

```powershell
git add src/components/order-confirmation.tsx src/components/order-history.tsx src/components/order-detail.tsx src/services/checkout.ts src/services/checkout.test.ts src/App.tsx src/styles.css
git commit -m "feat: add wholesale order follow-up experience"
```

---

### Task 5: Browser verification, accessibility polish, integration, and deployment

**Files:**
- Modify only files directly required by issues found during verification.

**Interfaces:**
- Consumes: complete implemented experience.
- Produces: verified production-ready feature on the repository default branch and Vercel.

- [ ] **Step 1: Start the production preview**

Run: `npm run build` followed by `npm run preview -- --host 127.0.0.1`.

Expected: preview serves the built site without console build errors.

- [ ] **Step 2: Verify the desktop journey**

At desktop width: add two products, adjust carton counts, confirm unit/box totals, complete all checkout steps with valid Brazilian data, submit, inspect confirmation, open history/detail, invoke print preview, reorder, and confirm the restored cart.

- [ ] **Step 3: Verify validation and failure states**

Confirm invalid CNPJ, email, phone, CEP, UF, and blank required values block progress with correctly associated messages; confirm empty cart cannot enter checkout; confirm later order statuses remain upcoming; confirm no order/payment network request occurs.

- [ ] **Step 4: Verify mobile and keyboard behavior**

At 375px and 320px widths, verify no horizontal overflow and all actions remain usable. Traverse forms by keyboard, verify visible focus, step-heading focus, Escape behavior for the cart, and reduced-motion styles.

- [ ] **Step 5: Fix only reproduced verification defects**

For each defect, add a failing test where it is business logic, make the smallest corrective change, rerun the targeted test, then rerun the full suite and build.

- [ ] **Step 6: Run the final verification gate**

Run:

```powershell
npm test -- --run
npm run build
git diff --check
git status --short
```

Expected: zero test failures, successful build, no whitespace errors, and only intended feature changes.

- [ ] **Step 7: Commit final verification fixes if any**

```powershell
git add src
git commit -m "fix: polish wholesale checkout flow"
```

Skip this commit when Step 5 required no changes.

- [ ] **Step 8: Integrate and deploy**

Merge the feature branch into `master`, push `master` to `origin`, wait for the connected Vercel production deployment, then verify the public alias returns HTTP 200 and displays the updated checkout.
