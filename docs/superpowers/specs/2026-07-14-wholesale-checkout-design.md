# Paki Toys Wholesale Checkout Design

## Goal

Extend the existing Paki Toys storefront demo into a complete, clickable wholesale ordering journey for retailers. Buyers should be able to order master cartons, enter company and delivery information, request freight, select commercial payment terms, submit a simulated order, review its status, print it, and reorder it. The demo must remain straightforward to connect to Medusa later without implying that a live order, payment, or freight service exists today.

## Scope

The feature adds:

- Case-based cart quantities and wholesale totals.
- A four-step checkout for company details, delivery, commercial terms, and review.
- Local simulated order submission with a Paki-style order reference.
- Order confirmation, order history, order detail, status tracking, printing, and reordering.
- Browser persistence through `localStorage` behind a replaceable repository interface.
- Validation, empty/error states, responsive layouts, accessibility behavior, automated tests, and browser verification.

The feature does not add:

- A running Medusa backend or API client.
- Authentication, customer accounts, or synchronization across browsers or devices.
- Live inventory reservation, freight pricing, taxes, invoicing, payments, email, or WhatsApp delivery.
- Collection of card, bank-account, or other sensitive payment credentials.
- Artificial advancement of simulated orders beyond the initial received status.

## Buyer and Commerce Model

The target buyer is a Brazilian retailer or wholesale customer. All checkout language and fields use Brazilian Portuguese.

Each cart quantity represents a number of master cartons. The existing `Product.masterQuantity` value defines the number of individual units in one carton. The storefront continues to treat `Product.price` as the per-unit merchandise price for demo purposes.

For every line:

- `boxCount` is the buyer-selected cart quantity.
- `unitsPerBox` is `product.masterQuantity`.
- `totalUnits` is `boxCount * unitsPerBox`.
- `lineSubtotal` is `product.price * totalUnits`.

The cart summary shows total cartons, total individual units, and merchandise subtotal. Freight is not included in the merchandise subtotal and is always displayed as pending calculation. No minimum-order value is enforced in this demo.

## Customer Journey

### Cart

The cart drawer uses wholesale language. Its quantity control increments or decrements cartons, and decrementing the final carton removes the line. Each item displays:

- Product image, title, and category.
- Price per unit.
- Units per carton.
- Selected carton count.
- Total individual units.
- Line subtotal.

The summary displays merchandise subtotal, total cartons, total units, and the message that freight and commercial terms require confirmation. The enabled primary action is **Continuar para o pedido**.

### Checkout

Checkout is a focused, full-screen experience within the existing React application. A visible step indicator communicates progress through four steps.

#### Step 1: Empresa

Required fields:

- CNPJ.
- Razão social.
- Nome do comprador.
- Business email.
- Phone or WhatsApp number.

Optional fields:

- Nome fantasia.
- Inscrição estadual.

#### Step 2: Entrega

Required fields:

- CEP.
- Street.
- Number.
- Neighborhood.
- City.
- State.
- Delivery contact.

Optional fields:

- Complement.
- Delivery instructions.

The demo does not call a CEP lookup or freight API. Freight is labeled **A calcular**, and the buyer is told that Paki will confirm the amount and delivery timing during commercial review.

#### Step 3: Condições

The buyer must select one of these demo commercial terms:

- **PIX à vista**.
- **Boleto faturado em 28 dias**.
- **Negociação comercial**.

Each option includes concise explanatory copy. Selecting an option does not initiate payment or approve credit.

#### Step 4: Revisão

The buyer reviews:

- Company and buyer details.
- Delivery address and contact.
- Product lines, cartons, total units, and merchandise totals.
- Freight status.
- Selected commercial terms.
- The notice that submission starts a commercial review rather than completing payment.

The primary action is **Enviar pedido para análise**. It is protected from duplicate submission while pending.

### Confirmation

Successful submission clears the active cart and displays:

- A generated Paki-style order reference.
- **Pedido recebido** status.
- Submission date and company name.
- Merchandise subtotal and pending freight status.
- An explanation that Paki will validate stock, freight, and payment terms.
- Actions to view the order, print its summary, open order history, or return to the storefront.

## Orders Experience

### Order History

The **Meus pedidos** screen lists locally saved orders with:

- Reference number.
- Submission date.
- Company name.
- Merchandise subtotal.
- Total cartons.
- Current status.

The empty state explains that submitted demo orders will appear in the current browser.

### Order Detail

The order-detail screen displays the complete submitted snapshot: company, buyer, address, delivery notes, commercial terms, product lines, carton and unit totals, freight status, and merchandise subtotal.

Its status timeline contains:

1. Pedido recebido.
2. Análise comercial.
3. Frete confirmado.
4. Pedido aprovado.
5. Faturado.
6. Enviado.

New demo orders remain at **Pedido recebido**. Later steps are visibly upcoming and are never presented as completed.

### Reorder and Print

**Comprar novamente** reconstructs the cart from the saved order lines, preserving the ordered carton counts, then returns the buyer to the storefront with the cart open. If a saved product is no longer in the active local catalog, that line is skipped and the buyer receives a clear notice.

**Imprimir resumo** invokes the browser print dialog and uses a dedicated print stylesheet that hides navigation and actions while preserving the reference, parties, lines, totals, freight state, and terms.

## Navigation Model

The app remains dependency-light and does not add a router. `App` owns a small explicit view state:

- `storefront`.
- `checkout`.
- `confirmation`.
- `orders`.
- `order-detail`.

The header exposes a **Meus pedidos** entry. Checkout, confirmation, and order screens provide clear back actions. Browser refresh returns to the storefront; submitted orders remain available through the persisted history. Shareable checkout or order URLs are outside this demo's scope.

## Domain Model

`src/domain/checkout.ts` defines focused types for:

- `CompanyDetails`.
- `DeliveryAddress`.
- `PaymentTerm`.
- `CheckoutDraft`.
- `WholesaleOrderLine`.
- `WholesaleOrderStatus`.
- `WholesaleOrder`.
- `OrderTotals`.

An order stores immutable product snapshots rather than live `Product` objects. Each line includes the product ID, handle, title, category, image, per-unit price, units per carton, carton count, total units, and line subtotal. This ensures order history remains understandable if catalog data changes.

## Service and Repository Boundaries

`src/services/checkout.ts` contains pure functions for:

- CNPJ, CEP, email, and phone normalization and validation.
- Brazilian CNPJ checksum validation.
- Step-level form validation.
- Carton, unit, and subtotal calculation.
- Wholesale-order creation from a validated checkout draft and cart.
- Reconstructing cart lines from a saved order and the current catalog.

`src/data/order-repository.ts` defines a `CheckoutRepository` interface:

- `placeOrder(order): Promise<WholesaleOrder>`.
- `listOrders(): Promise<WholesaleOrder[]>`.
- `getOrder(orderId): Promise<WholesaleOrder | null>`.

The initial `LocalOrderRepository` implementation serializes orders to a versioned `localStorage` key. Repository consumers do not access browser storage directly. A future Medusa adapter can implement the same interface and map real cart, customer, shipping, payment-session, and order data into the domain model.

## UI Components

The implementation adds focused components rather than growing `App` into a large checkout file:

- `CheckoutShell`: layout, step indicator, responsive order summary, and navigation.
- `CompanyStep`: company and buyer form.
- `DeliveryStep`: address and delivery form.
- `TermsStep`: commercial-term selection.
- `ReviewStep`: complete review and submission action.
- `OrderConfirmation`: received state and next actions.
- `OrderHistory`: locally saved orders and empty state.
- `OrderDetail`: submitted order snapshot and actions.
- `OrderStatusTimeline`: accessible current/upcoming status presentation.
- `OrderSummary`: reusable product and totals presentation for checkout, confirmation, detail, and print.

The visual direction continues the existing Paki Toys system: warm cream surfaces, navy structure, red primary actions, Fredoka display typography, rounded panels, playful but controlled shapes, and clear wholesale information density. Checkout reduces decorative elements compared with the storefront so business information and totals remain easy to scan.

## State and Data Flow

1. The buyer adds products; the cart quantity represents cartons.
2. The cart service derives total cartons, total units, line totals, and merchandise subtotal.
3. Starting checkout snapshots the current cart into a checkout draft while keeping the cart available until submission succeeds.
4. Each checkout step validates its own fields before advancing.
5. Review creates a complete wholesale order from the validated draft and current cart.
6. The repository persists the order.
7. On persistence success, the app clears the cart and shows confirmation.
8. On persistence failure, the cart and checkout draft remain intact and a recoverable error appears.
9. Order history and detail load through the repository interface.
10. Reordering maps saved line product IDs to the current catalog, restores valid carton quantities, and reports skipped products.

## Validation and Error Handling

- CNPJ accepts formatted or unformatted input, is normalized to 14 digits, rejects repeated digits, and must pass both checksum digits.
- CEP accepts formatted or unformatted input and must contain eight digits.
- Email uses practical format validation suitable for inline feedback.
- Phone accepts common Brazilian formatting and must normalize to 10 or 11 digits.
- Required text inputs reject whitespace-only values.
- State is required as a two-letter Brazilian UF code.
- A payment term is required before review.
- Empty carts cannot enter or submit checkout.
- The submit action is disabled while the repository request is pending.
- Repository read failures produce an orders error state; write failures preserve the draft and cart and allow retry.
- Missing order IDs show a friendly not-found state with a return action.
- Reorder reports any products that no longer exist in the catalog.
- All screens explicitly state that the experience is a demonstration and no live order or payment is created.

## Accessibility and Responsive Behavior

- Every input has a persistent label, associated inline error, and appropriate `autocomplete` and input-mode attributes.
- Step changes move focus to the new step heading, and validation failure focuses the first invalid field.
- Status is not communicated by color alone.
- All controls are keyboard accessible and preserve visible focus treatment.
- Loading, submission, and confirmation messages use appropriate live-region behavior.
- Desktop checkout uses a form-and-summary composition; mobile stacks the summary and keeps the primary action easy to reach without hiding content.
- The layout supports 320px-wide screens without horizontal overflow.
- Motion respects `prefers-reduced-motion`.
- Print output removes navigation, buttons, decorative backgrounds, and shadows.

## Testing and Verification

Automated tests cover:

- Carton counts, unit counts, line totals, and merchandise subtotal.
- CNPJ normalization and valid/invalid checksum cases.
- CEP, email, phone, required-field, and UF validation.
- Step validation and prevention of incomplete submission.
- Immutable order snapshot creation and reference formatting.
- Repository place, list, retrieve, malformed-storage, and write-failure behavior.
- Reordering available products and reporting unavailable products.
- Status timeline ordering and current/upcoming state derivation.

Verification also includes:

- Full Vitest suite with zero failures.
- TypeScript and Vite production build with zero errors.
- Browser walkthrough from adding products through checkout, confirmation, history, detail, print preview, and reorder.
- Refresh verification that order history persists and the active app view returns safely to the storefront.
- Desktop and mobile inspection for hierarchy, overflow, focus behavior, and form usability.
- Confirmation that no network request submits order, payment, or sensitive customer data.

## Success Criteria

The deployed demo allows a retailer to complete a credible Paki Toys wholesale journey from case-based cart through order confirmation, revisit and print the order, understand its commercial status, and reorder it. The experience clearly distinguishes a simulated request from a live transaction. Checkout and order persistence depend on domain and repository interfaces rather than browser storage details, so a future Medusa integration can replace the local adapter without rebuilding the customer-facing flow.
