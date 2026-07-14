# Paki Toys Stakeholder Demo Realism Design

## Goal

Make the Paki Toys wholesale storefront demo convincing enough for NoctiLabs to present as a credible vision of Paki's future retailer channel. The experience should help Paki stakeholders imagine an operational wholesale journey without implying that the demonstration contains Paki's real commercial policies, live inventory, freight contracts, customer accounts, or backend systems.

## Audience and Presentation Objective

The primary audience is Paki Toys leadership and commercial stakeholders evaluating whether NoctiLabs should design and implement the production platform.

The demo should communicate three ideas:

1. Paki can give retailers a polished, recognizably Paki buying experience.
2. A digital channel can expose account-specific prices, volume incentives, stock context, freight choices, and commercial support without making ordering complicated.
3. NoctiLabs has designed the frontend and domain boundaries so the concept can evolve into a Medusa-backed implementation rather than being discarded after the pitch.

The customer-facing experience remains Paki-first. NoctiLabs appears only through a discreet footer attribution: **Conceito digital por NoctiLabs**.

## Scope

The enhancement adds:

- Demonstration availability by master carton.
- Partner pricing labels and volume-price tiers.
- Cart savings and minimum-order progress.
- A one-click example order for reliable presentations.
- A one-click fictional retailer profile in checkout.
- A visible fictional commercial tier.
- Three simulated freight choices with price and delivery estimates.
- A generic Paki commercial-support card.
- Expanded review, order snapshots, confirmation, history, reorder, and print totals.
- Clear demonstration labels and NoctiLabs footer attribution.
- Centralized, replaceable commercial-policy services and tests.

The enhancement does not add:

- Live Paki stock, pricing, freight, customer, credit, or sales-representative data.
- Authentication, account registration, real customer records, or cloud persistence.
- Real order, quote, payment, email, WhatsApp, or CRM submission.
- A Medusa API client, mock HTTP server, admin dashboard, or production environment configuration.
- Invented personal contact details for a Paki employee.

## Guided Retailer Story

### Product Discovery

Product cards keep their current visual hierarchy and add a restrained wholesale context row:

- **Preço Parceiro** above or beside the per-unit price.
- A carton availability indicator such as **18 caixas disponíveis**.
- **Sob consulta** when a selected cart quantity exceeds the illustrative availability.

Cards remain concise. Detailed tier information belongs in quick view so the product grid does not become visually dense.

### Quick View

Quick view becomes the primary commercial decision surface. It displays:

- Partner unit price.
- Units per master carton.
- Price per carton before volume discounts.
- Demonstration carton availability.
- Volume tiers and the currently applicable tier.
- Estimated savings at each threshold.
- The existing age, category, and product facts.

Adding a product still adds one master carton and opens the wholesale cart.

### Example Order

The cart's empty state includes a secondary **Carregar pedido de exemplo** action. It creates a deterministic, presentation-ready cart using representative Paki products and carton quantities that exceed the demonstration minimum order.

The example order must:

- Use only products that exist in the current catalog.
- Produce at least one active volume discount.
- Remain below the illustrative availability for every line.
- Be reconstructable through a pure service rather than hard-coded in the component.
- Be clearly labeled as demonstration data.

### Wholesale Cart

The cart shows:

- Cartons and individual units per line.
- Partner unit price and undiscounted carton value.
- Applicable tier label and discount percentage.
- Discounted line subtotal and line savings.
- Illustrative availability or **Sob consulta**.
- Aggregate list value, volume savings, merchandise subtotal, carton count, and unit count.
- Progress toward the R$ 1.500 demonstration minimum.

The minimum progress component has three states:

- Below minimum: show the remaining value and an incomplete progress bar.
- Minimum reached: show a compact celebratory state.
- Empty cart: do not show minimum progress outside the example-order prompt.

The minimum guides the walkthrough but does not disable checkout. This prevents an awkward presentation dead end while still demonstrating a realistic wholesale policy.

### Fictional Retailer Profile

The company step includes a discreet dashed **Preencher com empresa de demonstração** action. It populates a fictional Brazilian retailer profile with:

- Valid-format CNPJ.
- Razão social and nome fantasia clearly associated with a fictional business.
- Buyer name, business email, and phone using obvious demonstration values.
- Complete delivery address.
- Commercial tier: **Parceiro Ouro**.

The profile is labeled **Dados de demonstração** wherever its tier is surfaced. No real person, company, or Paki employee identity is used.

### Freight Choice

The delivery step continues to collect or display the delivery address, then presents three simulated choices:

1. **Transportadora econômica** — R$ 189,00 — 5–7 business days.
2. **Transportadora expressa** — R$ 329,00 — 2–3 business days.
3. **Retirada programada** — free — approximately 2 business days.

The buyer must choose one option before review. Freight cards clearly state that prices and dates are illustrative. Selection updates the order summary immediately.

### Commercial Support

Checkout and order detail include a compact **Equipe comercial Paki** support card. It explains that a representative would confirm availability, freight, and payment terms. The interaction opens an inline demonstration message rather than sending data or navigating to a fake contact method.

No invented name, portrait, phone number, email address, or WhatsApp destination appears.

### Review and Confirmation

Review shows:

- Retailer identity and **Parceiro Ouro** tier.
- Products, cartons, units, and availability state.
- Merchandise list value.
- Volume savings.
- Discounted merchandise subtotal.
- Selected freight option and price.
- Estimated order total.
- Payment preference.
- Demonstration and commercial-review notices.

Confirmation retains the existing received-order story and adds the commercial breakdown, selected freight, tier, and savings. The primary document action is labeled **Baixar / imprimir resumo** and invokes the browser's print dialog, which supports saving as PDF without adding a PDF-generation dependency.

## Demonstration Commercial Policy

All illustrative values live in one centralized `DemoCommercialPolicy` configuration consumed through pure services.

### Minimum

- Merchandise minimum: R$ 1.500,00.
- Freight does not contribute toward the minimum.
- The minimum does not block checkout in the demonstration.

### Volume Tiers

- 1–2 cartons of a product: 0% discount.
- 3–5 cartons of a product: 5% demonstration discount.
- 6 or more cartons of a product: 8% demonstration discount.

Discounts apply independently per product line. Money is rounded to cents at the line level before aggregate totals are calculated.

### Availability

Each product receives a deterministic available-carton count through the local commercial-policy adapter. The values remain stable between reloads and do not depend on random runtime generation.

Availability is presentation context, not inventory enforcement:

- Selected quantity at or below availability: show the available-carton count.
- Selected quantity above availability: show **Sob consulta** and retain the line.

### Freight

Freight options use fixed illustrative prices and delivery estimates. Retirada programada has a zero price. The selected freight price contributes to the estimated order total but not merchandise savings or minimum-order progress.

## Domain Model

`src/domain/commercial.ts` defines:

- `CommercialTier`.
- `DemoRetailerProfile`.
- `VolumePricingTier`.
- `ProductAvailability`.
- `FreightOption`.
- `CommercialLinePricing`.
- `CommercialOrderTotals`.
- `MinimumOrderProgress`.

The checkout and order domain gains:

- Retailer tier.
- Selected freight option snapshot.
- Per-line list price, discount percentage, savings, and net subtotal.
- Aggregate list value, savings, merchandise subtotal, freight total, and estimated total.

Saved orders keep immutable copies of policy results. Future policy changes therefore do not rewrite historical order totals.

## Services and Data Boundaries

`src/data/demo-commercial-policy.ts` owns the illustrative configuration and deterministic availability map.

`src/services/commercial.ts` contains pure functions for:

- Selecting the applicable volume tier.
- Calculating line list value, discount, savings, and net subtotal.
- Calculating aggregate commercial totals.
- Calculating minimum-order progress.
- Determining availability versus **Sob consulta**.
- Returning the presentation example cart.
- Returning the fictional retailer profile.

UI components receive calculated commercial values rather than reimplementing policy formulas.

A later Medusa integration can replace these inputs with:

- Customer groups and price lists for retailer tiers and account pricing.
- Inventory modules and stock locations for availability.
- Fulfillment providers and shipping options for freight.
- Customer/company data for saved retailer profiles.
- Cart and order totals returned by Medusa.

The `CheckoutRepository` remains responsible for order persistence. It does not own pricing policy or freight calculation.

## UI Components

Focused components include:

- `AvailabilityBadge` for carton availability and **Sob consulta**.
- `VolumeTierTable` for thresholds and active-tier treatment.
- `MinimumOrderProgress` for below/reached states.
- `RetailerTierBadge` for the fictional **Parceiro Ouro** profile.
- `FreightOptions` for selection and explanatory copy.
- `CommercialSupportCard` for the non-sending support interaction.
- Expanded `OrderSummary` for list value, savings, freight, and estimated total.

Existing product card, quick view, cart drawer, checkout, confirmation, history, detail, and footer components consume these focused pieces.

## Visual Direction

The commercial layer must feel native to the existing playful Paki system:

- Navy continues to structure business information.
- Red remains reserved for primary calls to action.
- Gold accents identify **Parceiro Ouro** without introducing a generic SaaS aesthetic.
- Green communicates available and minimum-reached states.
- Yellow communicates demonstration minimum progress.
- Dashed outlines identify demo-only shortcuts and illustrative data.

Commercial information is deliberately denser in quick view, cart, and checkout, while product cards remain easy to scan. Motion is limited to the minimum-reached state and selection feedback and continues to respect reduced-motion preferences.

The footer adds **Conceito digital por NoctiLabs** in a small secondary line. No NoctiLabs mark appears in the header, checkout, confirmation, or product content.

## Data Flow

1. The catalog repository returns the 12 current Paki products.
2. The demo commercial policy supplies stable availability and tier rules.
3. Product surfaces calculate commercial presentation from product and policy data.
4. Cart calculations produce list value, line discounts, savings, net merchandise subtotal, and minimum progress.
5. Checkout may populate the fictional retailer profile without submitting data externally.
6. The buyer selects a freight option, which updates the estimated total.
7. Order creation snapshots retailer tier, freight, line policy results, and totals.
8. The local repository persists the immutable order.
9. Confirmation, history, detail, print, and reorder consume saved snapshots.
10. Reorder recalculates current commercial policy for the new cart rather than silently reusing historical discounts or availability.

## Error and Edge States

- Missing commercial configuration for a product falls back to **Disponibilidade sob consulta** and standard partner pricing.
- Quantities beyond illustrative availability remain orderable and display **Sob consulta**.
- A missing product in the example-order preset is skipped and reported without breaking the cart.
- A browser-storage write failure preserves checkout and cart state.
- Freight selection is required before review; no default is silently assumed.
- Reorder reports products no longer present in the catalog.
- Print output includes every commercial total and demonstration disclaimer.
- All demo shortcuts, stock, prices, discounts, freight, and delivery dates are explicitly described as illustrative.

## Accessibility and Responsive Behavior

- Availability, tiers, savings, and freight selection never rely on color alone.
- Freight choices use native radio semantics.
- Minimum progress includes text describing the remaining or reached amount.
- Tier tables remain readable without horizontal scrolling at 320px.
- Inline support messages use an appropriate live region.
- New controls are keyboard accessible with visible focus treatment.
- Print output removes controls, decorative backgrounds, and the NoctiLabs footer attribution while retaining the Paki order identity and disclaimer.

## Testing and Verification

Automated tests cover:

- Tier selection at 1, 2, 3, 5, and 6 cartons.
- Cent-rounded line and aggregate totals.
- Savings and minimum-order progress below, at, and above the threshold.
- Freight totals for all three choices.
- Stable availability and **Sob consulta** behavior.
- Example-order composition and missing-product handling.
- Fictional retailer-profile population.
- Order snapshot consistency.
- Reorder recalculation under current policy.

Verification includes:

- Full Vitest suite with zero failures.
- TypeScript and Vite production build with zero errors.
- Non-visual production checks confirming all 12 products and images remain present.
- Checkout submission, persistence, history, order detail, print, and reorder logic verification.
- Vercel production deployment status, HTTP 200, and production-bundle content checks.

Visual-computer testing is not required for this enhancement because the user explicitly opted out of that verification method.

## Success Criteria

The demo allows NoctiLabs to walk Paki stakeholders through a believable retailer journey that demonstrates account context, carton availability, volume pricing, minimum-order guidance, freight selection, commercial support, confirmation, and reorder. Every illustrative value is clearly identified as demonstration data. The enhancements strengthen the pitch without introducing a fake backend or coupling the interface to assumptions that would prevent a future Medusa implementation.
