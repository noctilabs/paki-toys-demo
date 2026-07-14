import { useCallback, useEffect, useMemo, useState } from "react"
import { CartDrawer } from "./components/cart-drawer"
import { CategoryRail } from "./components/category-rail"
import { Footer } from "./components/footer"
import { Header } from "./components/header"
import { Hero } from "./components/hero"
import { ProductGrid } from "./components/product-grid"
import { Promotion } from "./components/promotion"
import { QuickView } from "./components/quick-view"
import { ValueStrip } from "./components/value-strip"
import { localCatalogRepository } from "./data/catalog-repository"
import type { CartLine, Category, Product } from "./domain/catalog"
import { addCartItem, cartItemCount, cartSubtotal, changeCartQuantity, removeCartItem } from "./services/cart"
import { filterProducts } from "./services/catalog"

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
  const cartCount = cartItemCount(cartLines)
  const subtotal = cartSubtotal(cartLines)

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

  return (
    <>
      <Header
        query={query}
        onQueryChange={setQuery}
        favoriteCount={favorites.size}
        cartCount={cartCount}
        cartOpen={cartOpen}
        onCartOpen={() => setCartOpen(true)}
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
        onClose={closeCart}
        onQuantityChange={(productId, delta) => setCartLines((current) => changeCartQuantity(current, productId, delta))}
        onRemove={(productId) => setCartLines((current) => removeCartItem(current, productId))}
      />
    </>
  )
}
