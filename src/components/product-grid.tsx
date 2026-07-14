import type { Product } from "../domain/catalog"
import { ProductCard } from "./product-card"

type ProductGridProps = {
  products: Product[]
  favorites: Set<string>
  activeCategoryName?: string
  onFavorite: (productId: string) => void
  onQuickView: (product: Product) => void
  onAdd: (product: Product) => void
  onReset: () => void
}

export function ProductGrid({ products, favorites, activeCategoryName, onFavorite, onQuickView, onAdd, onReset }: ProductGridProps) {
  return (
    <section className="products-section" id="produtos" aria-labelledby="products-title">
      <div className="shell">
        <div className="section-heading section-heading--split products-heading">
          <div>
            <span className="section-kicker">Nossos queridinhos</span>
            <h2 id="products-title">Brinquedos para boas histórias</h2>
          </div>
          <div className="product-count"><strong>{products.length}</strong> {activeCategoryName ? `em ${activeCategoryName}` : "brinquedos"}</div>
        </div>

        {products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                favorite={favorites.has(product.id)}
                onFavorite={onFavorite}
                onQuickView={onQuickView}
                onAdd={onAdd}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span aria-hidden="true">◌</span>
            <h3>Nenhum brinquedo encontrado</h3>
            <p>Tente outra palavra ou volte a explorar todos os mundos Paki.</p>
            <button className="button button--blue" type="button" onClick={onReset}>Limpar busca</button>
          </div>
        )}
      </div>
    </section>
  )
}
