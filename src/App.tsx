import { useCallback, useEffect, useMemo, useState } from "react"
import { CartDrawer } from "./components/cart-drawer"
import { CategoryRail } from "./components/category-rail"
import { Checkout } from "./components/checkout"
import { Footer } from "./components/footer"
import { Header } from "./components/header"
import { Hero } from "./components/hero"
import { OrderConfirmation } from "./components/order-confirmation"
import { OrderDetail } from "./components/order-detail"
import { OrderHistory } from "./components/order-history"
import { ProductGrid } from "./components/product-grid"
import { Promotion } from "./components/promotion"
import { QuickView } from "./components/quick-view"
import { ValueStrip } from "./components/value-strip"
import { localCatalogRepository } from "./data/catalog-repository"
import { LocalOrderRepository } from "./data/order-repository"
import type { CartLine, Category, Product } from "./domain/catalog"
import type { CheckoutDraft, WholesaleOrder } from "./domain/checkout"
import {
  addCartItem,
  cartBoxCount,
  cartUnitCount,
  changeCartQuantity,
  removeCartItem,
} from "./services/cart"
import { filterProducts } from "./services/catalog"
import { createWholesaleOrder, emptyCheckoutDraft, restoreOrderCart } from "./services/checkout"
import { buildExampleCart, calculateCommercialTotals, getProductAvailability } from "./services/commercial"

type AppView = "storefront" | "checkout" | "confirmation" | "orders" | "order-detail"

function freshCheckoutDraft(): CheckoutDraft {
  return {
    company: { ...emptyCheckoutDraft.company },
    delivery: { ...emptyCheckoutDraft.delivery },
    commercialTier: "gold",
    freightOptionId: "",
    paymentTerm: "",
  }
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set())
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [cartLines, setCartLines] = useState<CartLine[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [view, setView] = useState<AppView>("storefront")
  const [checkoutDraft, setCheckoutDraft] = useState<CheckoutDraft>(freshCheckoutDraft)
  const [confirmedOrder, setConfirmedOrder] = useState<WholesaleOrder | null>(null)
  const [submittingOrder, setSubmittingOrder] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [orders, setOrders] = useState<WholesaleOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<WholesaleOrder | null>(null)
  const [reorderNotice, setReorderNotice] = useState("")
  const orderRepository = useMemo(() => new LocalOrderRepository(window.localStorage), [])

  useEffect(() => {
    Promise.all([localCatalogRepository.listProducts(), localCatalogRepository.listCategories()])
      .then(([catalogProducts, catalogCategories]) => {
        setProducts(catalogProducts)
        setCategories(catalogCategories)
      })
  }, [])

  const visibleProducts = useMemo(
    () => filterProducts(products, query, activeCategory),
    [products, query, activeCategory],
  )
  const activeCategoryName = categories.find((category) => category.handle === activeCategory)?.name
  const cartCount = cartBoxCount(cartLines)
  const cartUnits = cartUnitCount(cartLines)
  const commercialTotals = useMemo(() => calculateCommercialTotals(cartLines), [cartLines])
  const cartTotals = useMemo(() => ({
    boxCount: cartCount,
    unitCount: cartUnits,
    merchandiseSubtotal: commercialTotals.merchandiseSubtotal,
  }), [cartCount, cartUnits, commercialTotals.merchandiseSubtotal])

  const closeQuickView = useCallback(() => setQuickViewProduct(null), [])
  const closeCart = useCallback(() => setCartOpen(false), [])

  function selectCategory(handle: string) {
    setActiveCategory(handle)
    document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function toggleFavorite(productId: string) {
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }

  function addProduct(product: Product) {
    setCartLines((current) => addCartItem(current, product))
    setQuickViewProduct(null)
    setCartOpen(true)
  }

  function resetFilters() {
    setQuery("")
    setActiveCategory("all")
  }

  function loadExampleOrder() {
    const example = buildExampleCart(products)
    setCartLines(example.lines)
    setCartOpen(true)
    setReorderNotice(example.missingProductIds.length > 0
      ? `Alguns itens de demonstração não foram encontrados: ${example.missingProductIds.join(", ")}.`
      : "Pedido de exemplo carregado com dados de demonstração.")
  }

  function showStorefront(openCart = false) {
    setView("storefront")
    setCartOpen(openCart)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function startCheckout() {
    if (cartLines.length === 0) return
    setCartOpen(false)
    setSubmitError("")
    setView("checkout")
  }

  async function submitCheckout() {
    if (submittingOrder) return
    setSubmittingOrder(true)
    setSubmitError("")
    try {
      const order = createWholesaleOrder(checkoutDraft, cartLines)
      await orderRepository.placeOrder(order)
      setCartLines([])
      setCheckoutDraft(freshCheckoutDraft())
      setConfirmedOrder(order)
      setView("confirmation")
      window.scrollTo({ top: 0 })
    } catch {
      setSubmitError("Seus dados e sua sacola foram preservados. Tente enviar novamente.")
    } finally {
      setSubmittingOrder(false)
    }
  }

  async function openOrders() {
    setView("orders")
    setOrdersLoading(true)
    setOrdersError("")
    window.scrollTo({ top: 0 })
    try {
      setOrders(await orderRepository.listOrders())
    } catch {
      setOrdersError("O armazenamento deste navegador não está disponível. Tente novamente em outro navegador.")
    } finally {
      setOrdersLoading(false)
    }
  }

  function openOrder(order: WholesaleOrder) {
    setSelectedOrder(order)
    setReorderNotice("")
    setView("order-detail")
    window.scrollTo({ top: 0 })
  }

  function reorder(order: WholesaleOrder) {
    const restored = restoreOrderCart(order, products)
    if (restored.lines.length === 0) {
      setReorderNotice("Os produtos deste pedido não estão mais disponíveis no catálogo da demonstração.")
      return
    }

    setCartLines(restored.lines)
    setReorderNotice(restored.missingProductTitles.length > 0
      ? `Alguns produtos não estavam disponíveis: ${restored.missingProductTitles.join(", ")}.`
      : "Pedido restaurado na sacola em caixas.")
    showStorefront(true)
  }

  if (view === "checkout") {
    return (
      <Checkout
        lines={cartLines}
        totals={cartTotals}
        draft={checkoutDraft}
        submitting={submittingOrder}
        submitError={submitError}
        onDraftChange={setCheckoutDraft}
        onSubmit={submitCheckout}
        onCancel={() => showStorefront(false)}
      />
    )
  }

  if (view === "confirmation" && confirmedOrder) {
    return (
      <OrderConfirmation
        order={confirmedOrder}
        onViewOrder={() => openOrder(confirmedOrder)}
        onOpenOrders={() => { void openOrders() }}
        onStorefront={() => showStorefront(false)}
      />
    )
  }

  if (view === "orders") {
    return (
      <OrderHistory
        orders={orders}
        loading={ordersLoading}
        error={ordersError}
        onOpenOrder={openOrder}
        onStorefront={() => showStorefront(false)}
      />
    )
  }

  if (view === "order-detail" && selectedOrder) {
    return (
      <OrderDetail
        order={selectedOrder}
        reorderNotice={reorderNotice}
        onBack={() => { void openOrders() }}
        onReorder={() => reorder(selectedOrder)}
        onStorefront={() => showStorefront(false)}
      />
    )
  }

  return (
    <>
      <Header
        query={query}
        onQueryChange={setQuery}
        favoriteCount={favorites.size}
        cartCount={cartCount}
        cartOpen={cartOpen}
        onCartOpen={() => setCartOpen(true)}
        onOrdersOpen={() => { void openOrders() }}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={() => setMobileMenuOpen((current) => !current)}
      />
      {reorderNotice && <div className="storefront-notice" role="status"><span>{reorderNotice}</span><button type="button" onClick={() => setReorderNotice("")} aria-label="Fechar aviso">×</button></div>}
      <main>
        <Hero onExplore={() => document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth" })} />
        <CategoryRail categories={categories} activeCategory={activeCategory} onSelect={selectCategory} />
        <ProductGrid
          products={visibleProducts}
          favorites={favorites}
          activeCategoryName={activeCategoryName}
          getAvailability={getProductAvailability}
          onFavorite={toggleFavorite}
          onQuickView={setQuickViewProduct}
          onAdd={addProduct}
          onReset={resetFilters}
        />
        <ValueStrip />
        <Promotion />
      </main>
      <Footer />
      <QuickView product={quickViewProduct} onClose={closeQuickView} onAdd={addProduct} />
      <CartDrawer
        open={cartOpen}
        lines={cartLines}
        boxCount={cartCount}
        unitCount={cartUnits}
        onClose={closeCart}
        onCheckout={startCheckout}
        onLoadExampleOrder={loadExampleOrder}
        onQuantityChange={(productId, delta) => setCartLines((current) => changeCartQuantity(current, productId, delta))}
        onRemove={(productId) => setCartLines((current) => removeCartItem(current, productId))}
      />
    </>
  )
}
