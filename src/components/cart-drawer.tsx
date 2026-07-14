import { useEffect, useRef } from "react"
import type { CartLine } from "../domain/catalog"
import { BagIcon, CloseIcon, MinusIcon, PlusIcon, TrashIcon } from "./icons"

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

type CartDrawerProps = {
  open: boolean
  lines: CartLine[]
  subtotal: number
  onClose: () => void
  onQuantityChange: (productId: string, delta: number) => void
  onRemove: (productId: string) => void
}

export function CartDrawer({ open, lines, subtotal, onClose, onQuantityChange, onRemove }: CartDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
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
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="overlay overlay--drawer" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="cart-drawer__header">
          <div><span className="section-kicker">Sua seleção</span><h2 id="cart-title">Sacola de brincadeiras</h2></div>
          <button ref={closeRef} className="dialog-close dialog-close--inline" type="button" onClick={onClose} aria-label="Fechar sacola"><CloseIcon /></button>
        </div>

        {lines.length === 0 ? (
          <div className="cart-empty">
            <span><BagIcon /></span>
            <h3>Sua sacola está esperando</h3>
            <p>Escolha um brinquedo e comece uma nova história.</p>
            <button className="button button--blue" type="button" onClick={onClose}>Explorar brinquedos</button>
          </div>
        ) : (
          <>
            <div className="cart-lines">
              {lines.map(({ product, quantity }) => (
                <article className="cart-line" key={product.id}>
                  <div className="cart-line__image"><img src={product.image} alt="" /></div>
                  <div className="cart-line__content">
                    <span>{product.category}</span>
                    <h3>{product.title}</h3>
                    <strong>{currency.format(product.price)}</strong>
                    <div className="cart-line__actions">
                      <div className="quantity" aria-label={`Quantidade de ${product.title}`}>
                        <button type="button" onClick={() => onQuantityChange(product.id, -1)} aria-label="Diminuir quantidade"><MinusIcon /></button>
                        <span aria-live="polite">{quantity}</span>
                        <button type="button" onClick={() => onQuantityChange(product.id, 1)} aria-label="Aumentar quantidade"><PlusIcon /></button>
                      </div>
                      <button className="remove-button" type="button" onClick={() => onRemove(product.id)} aria-label={`Remover ${product.title}`}><TrashIcon /></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="cart-summary">
              <div><span>Subtotal</span><strong>{currency.format(subtotal)}</strong></div>
              <p>Frete e condições comerciais serão calculados na experiência final.</p>
              <button className="button button--red button--full" type="button" disabled>Finalizar compra — demonstração</button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
