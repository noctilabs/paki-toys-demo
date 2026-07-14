import type { CartLine } from "../domain/catalog"
import type { CommercialOrderTotals } from "../domain/commercial"
import type { OrderTotals, WholesaleOrderLine } from "../domain/checkout"
import { calculateCommercialTotals, calculateMinimumProgress, priceCommercialLine } from "../services/commercial"
import { MinimumOrderProgressView } from "./minimum-order-progress"

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

type CommercialOrderLine = WholesaleOrderLine & Partial<{
  listValue: number
  discountLabel: string
  savings: number
  netSubtotal: number
}>

type SummaryLine = CommercialOrderLine & {
  listValue: number
  discountLabel: string
  savings: number
  netSubtotal: number
}

type OrderSummaryProps = {
  cartLines?: CartLine[]
  orderLines?: CommercialOrderLine[]
  totals: OrderTotals
  commercialTotals?: CommercialOrderTotals
  freightTitle?: string
  compact?: boolean
}

export function OrderSummary({
  cartLines = [],
  orderLines = [],
  totals,
  commercialTotals,
  freightTitle,
  compact = false,
}: OrderSummaryProps) {
  const lines: SummaryLine[] = orderLines.length > 0
    ? orderLines.map((line) => ({
      ...line,
      listValue: line.listValue ?? line.lineSubtotal,
      discountLabel: line.discountLabel ?? "Preço Parceiro",
      savings: line.savings ?? 0,
      netSubtotal: line.netSubtotal ?? line.lineSubtotal,
    }))
    : cartLines.map(({ product, quantity }) => {
      const pricing = priceCommercialLine({ product, quantity })
      return {
        productId: product.id,
        handle: product.handle,
        title: product.title,
        category: product.category,
        image: product.image,
        unitPrice: product.price,
        unitsPerBox: product.masterQuantity,
        boxCount: quantity,
        totalUnits: product.masterQuantity * quantity,
        lineSubtotal: pricing.netSubtotal,
        listValue: pricing.listValue,
        discountLabel: pricing.discountLabel,
        savings: pricing.savings,
        netSubtotal: pricing.netSubtotal,
      }
    })

  const resolvedCommercialTotals = commercialTotals ?? (cartLines.length > 0
    ? calculateCommercialTotals(cartLines)
    : {
      listValue: lines.reduce((sum, line) => sum + line.listValue, 0),
      savings: lines.reduce((sum, line) => sum + line.savings, 0),
      merchandiseSubtotal: lines.reduce((sum, line) => sum + line.netSubtotal, 0),
      freightTotal: 0,
      estimatedTotal: lines.reduce((sum, line) => sum + line.netSubtotal, 0),
    })
  const minimumProgress = calculateMinimumProgress(resolvedCommercialTotals.merchandiseSubtotal)

  return (
    <section className={`order-summary${compact ? " order-summary--compact" : ""}`} aria-labelledby="order-summary-title">
      <div className="order-summary__heading">
        <div><span className="section-kicker">Resumo comercial</span><h2 id="order-summary-title">Seu pedido em caixas</h2></div>
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
              <small>{line.discountLabel} · {currency.format(line.unitPrice)} por unidade</small>
            </div>
            <div className="order-summary-line__values">
              {line.savings > 0 && <small>{currency.format(line.listValue)}</small>}
              <strong>{currency.format(line.netSubtotal)}</strong>
            </div>
          </article>
        ))}
      </div>

      <dl className="order-totals">
        <div><dt>Total de caixas</dt><dd>{totals.boxCount}</dd></div>
        <div><dt>Total de unidades</dt><dd>{totals.unitCount}</dd></div>
        <div><dt>Valor de tabela</dt><dd>{currency.format(resolvedCommercialTotals.listValue)}</dd></div>
        <div className="order-totals__savings"><dt>Economia por volume</dt><dd>− {currency.format(resolvedCommercialTotals.savings)}</dd></div>
        <div><dt>Subtotal de mercadorias</dt><dd>{currency.format(resolvedCommercialTotals.merchandiseSubtotal)}</dd></div>
        <div><dt>Frete{freightTitle ? ` · ${freightTitle}` : ""}</dt><dd className={freightTitle ? "" : "pending-value"}>{freightTitle ? currency.format(resolvedCommercialTotals.freightTotal) : "A selecionar"}</dd></div>
        <div className="order-totals__grand"><dt>Total estimado</dt><dd>{currency.format(resolvedCommercialTotals.estimatedTotal)}</dd></div>
      </dl>
      {cartLines.length > 0 && <MinimumOrderProgressView progress={minimumProgress} />}
      <p className="order-summary__note">Valores, disponibilidade e condições comerciais são dados de demonstração.</p>
    </section>
  )
}
