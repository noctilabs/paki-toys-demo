import { useCallback, useEffect, useMemo, useState } from "react"
import { CartDrawer } from "./components/cart-drawer"
import { CategoryRail } from "./components/category-rail"
import { Checkout } from "./components/checkout"
import { Footer } from "./components/footer"
import { Header } from "./components/header"
import { Hero } from "./components/hero"
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
  cartSubtotal,
  cartUnitCount,
  changeCartQuantity,
  removeCartItem,
} from "./services/cart"
import { filterProducts } from "./services/catalog"
import { createWholesaleOrder, emptyCheckoutDraft } from "./services/checkout"

type AppView = "storefront" | "checkout" | "confirmation" | "orders" | "order-detail"

function freshCheckoutDraft(): CheckoutDraft {
  return {
    company: { ...emptyCheckoutDraft.company },
    delivery: { ...emptyCheckoutDraft.delivery },
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
  const subtotal = cartSubtotal(cartLines)
  const cartTotals = useMemo(() => ({
    boxCount: cartCount,
    unitCount: cartUnits,
    merchandiseSubtotal: subtotal,
  }), [cartCount, cartUnits, subtotal])

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
      <main className="checkout-page simple-app-view">
        <img src="/paki/logo.webp" alt="Paki Toys" />
        <span className="section-kicker">Pedido recebido</span>
        <h1>{confirmedOrder.reference}</h1>
        <p>Recebemos a solicitação de {confirmedOrder.company.tradeName || confirmedOrder.company.legalName} para análise comercial.</p>
        <div><button className="button button--red" type="button" onClick={() => setView("orders")}>Meus pedidos</button><button className="button button--ghost" type="button" onClick={() => showStorefront(false)}>Voltar à loja</button></div>
      </main>
    )
  }

  if (view === "orders" || view === "order-detail") {
    return (
      <main className="checkout-page simple-app-view">
        <img src="/paki/logo.webp" alt="Paki Toys" />
        <span className="section-kicker">Área do lojista</span>
        <h1>Meus pedidos</h1>
        <p>O histórico detalhado será carregado a partir deste navegador.</p>
        <button className="button button--blue" type="button" onClick={() => showStorefront(false)}>Voltar à loja</button>
      </main>
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
        onOrdersOpen={() => setView("orders")}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={() => setMobileMenuOpen((current) => !current)}
      />
      <main>
        <Hero onExplore={() => document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth" })} />
        <CategoryRail categories={categories} activeCategory={activeCategory} onSelect={selectCategory} />
        <ProductGrid
          products={visibleProducts}
          favorites={favorites}
          activeCategoryName={activeCategoryName}
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
        subtotal={subtotal}
        boxCount={cartCount}
        unitCount={cartUnits}
        onClose={closeCart}
        onCheckout={startCheckout}
        onQuantityChange={(productId, delta) => setCartLines((current) => changeCartQuantity(current, productId, delta))}
        onRemove={(productId) => setCartLines((current) => removeCartItem(current, productId))}
      />
    </>
  )
}
