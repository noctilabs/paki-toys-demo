import type { CartLine } from "../domain/catalog"
import type { OrderTotals, WholesaleOrderLine } from "../domain/checkout"

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

type OrderSummaryProps = {
  cartLines?: CartLine[]
  orderLines?: WholesaleOrderLine[]
  totals: OrderTotals
  compact?: boolean
}

export function OrderSummary({ cartLines = [], orderLines = [], totals, compact = false }: OrderSummaryProps) {
  const lines: WholesaleOrderLine[] = orderLines.length > 0
    ? orderLines
    : cartLines.map(({ product, quantity }) => ({
      productId: product.id,
      handle: product.handle,
      title: product.title,
      category: product.category,
      image: product.image,
      unitPrice: product.price,
      unitsPerBox: product.masterQuantity,
      boxCount: quantity,
      totalUnits: product.masterQuantity * quantity,
      lineSubtotal: Math.round(product.price * product.masterQuantity * quantity * 100) / 100,
    }))

  return (
    <section className={`order-summary${compact ? " order-summary--compact" : ""}`} aria-labelledby="order-summary-title">
      <div className="order-summary__heading">
        <div>
          <span className="section-kicker">Resumo comercial</span>
          <h2 id="order-summary-title">Seu pedido em caixas</h2>
        </div>
        <span className="order-summary__badge">{totals.boxCount} {totals.boxCount === 1 ? "caixa" : "caixas"}</span>
      </div>

      <div className="order-summary__lines">
        {lines.map((line) => (
          <article className="order-summary-line" key={line.productId}>
            <div className="order-summary-line__image"><img src={line.image} alt="" /></div>
            <div>
              <span>{line.category}</span>
              <h3>{line.title}</h3>
              <p>{line.boxCount} cx. × {line.unitsPerBox} un. <b>{line.totalUnits} unidades</b></p>
              <small>{currency.format(line.unitPrice)} por unidade</small>
            </div>
            <strong>{currency.format(line.lineSubtotal)}</strong>
          </article>
        ))}
      </div>

      <dl className="order-totals">
        <div><dt>Total de caixas</dt><dd>{totals.boxCount}</dd></div>
        <div><dt>Total de unidades</dt><dd>{totals.unitCount}</dd></div>
        <div><dt>Frete</dt><dd className="pending-value">A calcular</dd></div>
        <div className="order-totals__grand"><dt>Subtotal de mercadorias</dt><dd>{currency.format(totals.merchandiseSubtotal)}</dd></div>
      </dl>
      <p className="order-summary__note">Frete, disponibilidade e condições comerciais serão confirmados pela equipe Paki.</p>
    </section>
  )
}
