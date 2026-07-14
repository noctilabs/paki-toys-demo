import type { Product } from "../domain/catalog"
import { EyeIcon, HeartIcon, PlusIcon } from "./icons"

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

type ProductCardProps = {
  product: Product
  favorite: boolean
  onFavorite: (productId: string) => void
  onQuickView: (product: Product) => void
  onAdd: (product: Product) => void
}

export function ProductCard({ product, favorite, onFavorite, onQuickView, onAdd }: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-card__visual">
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button className={`favorite-button ${favorite ? "is-favorite" : ""}`} type="button" onClick={() => onFavorite(product.id)} aria-label={favorite ? `Remover ${product.title} dos favoritos` : `Favoritar ${product.title}`} aria-pressed={favorite}>
          <HeartIcon filled={favorite} />
        </button>
        <button className="product-image-button" type="button" onClick={() => onQuickView(product)} aria-label={`Ver detalhes de ${product.title}`}>
          <img src={product.image} alt={product.title} onError={(event) => { event.currentTarget.src = "/paki/logo.webp" }} />
          <span className="quick-chip"><EyeIcon /> Vista rápida</span>
        </button>
      </div>
      <div className="product-card__body">
        <div className="product-meta"><span>{product.category}</span><span>{product.age}</span></div>
        <button className="product-title" type="button" onClick={() => onQuickView(product)}>{product.title}</button>
        <p>{product.description}</p>
        <div className="product-card__footer">
          <div className="product-price"><small>A partir de</small><strong>{currency.format(product.price)}</strong></div>
          <button className="add-button" type="button" onClick={() => onAdd(product)} aria-label={`Adicionar ${product.title} à sacola`}><PlusIcon /></button>
        </div>
      </div>
    </article>
  )
}
