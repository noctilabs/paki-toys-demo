import { useEffect, useRef } from "react"
import type { CartLine } from "../domain/catalog"
import { cartLineSubtotal } from "../services/cart"
import { BagIcon, CloseIcon, MinusIcon, PlusIcon, TrashIcon } from "./icons"

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

type CartDrawerProps = {
  open: boolean
  lines: CartLine[]
  subtotal: number
  boxCount: number
  unitCount: number
  onClose: () => void
  onCheckout: () => void
  onQuantityChange: (productId: string, delta: number) => void
  onRemove: (productId: string) => void
}

export function CartDrawer({
  open,
  lines,
  subtotal,
  boxCount,
  unitCount,
  onClose,
  onCheckout,
  onQuantityChange,
  onRemove,
}: CartDrawerProps) {
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
                    <strong>{currency.format(product.price)} <small>por unidade</small></strong>
                    <dl className="cart-line__wholesale">
                      <div><dt>Unidades/caixa</dt><dd>{product.masterQuantity}</dd></div>
                      <div><dt>Total de unidades</dt><dd>{product.masterQuantity * quantity}</dd></div>
                      <div><dt>Subtotal</dt><dd>{currency.format(cartLineSubtotal({ product, quantity }))}</dd></div>
                    </dl>
                    <div className="cart-line__actions">
                      <div className="quantity" aria-label={`Caixas de ${product.title}`}>
                        <button type="button" onClick={() => onQuantityChange(product.id, -1)} aria-label="Diminuir caixas"><MinusIcon /></button>
                        <span aria-live="polite">{quantity}</span>
                        <button type="button" onClick={() => onQuantityChange(product.id, 1)} aria-label="Aumentar caixas"><PlusIcon /></button>
                      </div>
                      <button className="remove-button" type="button" onClick={() => onRemove(product.id)} aria-label={`Remover ${product.title}`}><TrashIcon /></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="cart-summary">
              <div className="cart-summary__counts">
                <span><strong>{boxCount}</strong> {boxCount === 1 ? "caixa" : "caixas"}</span>
                <span><strong>{unitCount}</strong> unidades</span>
              </div>
              <div><span>Subtotal de mercadorias</span><strong>{currency.format(subtotal)}</strong></div>
              <p>Frete e condições comerciais serão confirmados pela equipe Paki após a análise.</p>
              <button className="button button--red button--full" type="button" onClick={onCheckout}>Continuar para o pedido</button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
