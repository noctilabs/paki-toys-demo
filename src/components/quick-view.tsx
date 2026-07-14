import { useEffect, useRef } from "react"
import type { Product } from "../domain/catalog"
import { getProductAvailability, priceCommercialLine } from "../services/commercial"
import { AvailabilityBadge } from "./commercial-badges"
import { BagIcon, CloseIcon, SparkIcon } from "./icons"
import { VolumeTierTable } from "./volume-tier-table"

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

type QuickViewProps = {
  product: Product | null
  onClose: () => void
  onAdd: (product: Product) => void
}

export function QuickView({ product, onClose, onAdd }: QuickViewProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!product) return
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose() }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
      previousFocus?.focus()
    }
  }, [product, onClose])

  if (!product) return null

  const cartonPricing = priceCommercialLine({ product, quantity: 1 })
  const volumeExample = priceCommercialLine({ product, quantity: 3 })
  const availableBoxes = getProductAvailability(product.id)

  return (
    <div className="overlay" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
      <section className="quick-view" role="dialog" aria-modal="true" aria-labelledby="quick-view-title">
        <button ref={closeRef} className="dialog-close" type="button" onClick={onClose} aria-label="Fechar detalhes"><CloseIcon /></button>
        <div className="quick-view__visual">
          <span className="quick-view__stamp"><SparkIcon /> Paki indica</span>
          <img src={product.image} alt={product.title} />
        </div>
        <div className="quick-view__content">
          <span className="section-kicker">{product.category}</span>
          <h2 id="quick-view-title">{product.title}</h2>
          <p className="quick-view__description">{product.description}</p>
          <div className="product-facts">
            <div><small>Idade</small><strong>{product.age}</strong></div>
            <div><small>Referência</small><strong>{product.ref}</strong></div>
            <div><small>Medidas</small><strong>{product.productDimensions}</strong></div>
          </div>
          <div className="quick-view__commercial">
            <div className="quick-view__commercial-head">
              <AvailabilityBadge availableBoxes={availableBoxes} />
              <span className="commercial-label">Preço Parceiro</span>
            </div>
            <div className="quick-view__price-grid">
              <div><small>Por unidade</small><strong>{currency.format(product.price)}</strong></div>
              <div><small>Por caixa</small><strong>{currency.format(cartonPricing.listValue)}</strong></div>
            </div>
            <VolumeTierTable activeBoxCount={1} />
            <p className="quick-view__savings-example">
              Exemplo com 3 caixas: <strong>economia de {currency.format(volumeExample.savings)}</strong>
              <span>Dados de demonstração</span>
            </p>
          </div>
          <div className="quick-view__purchase">
            <div className="product-price"><small>1 caixa demonstrativa</small><strong>{currency.format(cartonPricing.netSubtotal)}</strong></div>
            <button className="button button--red" type="button" onClick={() => onAdd(product)}><BagIcon /> Adicionar à sacola</button>
          </div>
          <p className="demo-note">Demonstração visual — valores e disponibilidade serão integrados ao catálogo final.</p>
        </div>
      </section>
    </div>
  )
}
