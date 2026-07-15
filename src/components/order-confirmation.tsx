import type { WholesaleOrder } from "../domain/checkout"
import { paymentTermLabel } from "../services/checkout"
import { RetailerTierBadge } from "./commercial-badges"
import { OrderSummary } from "./order-summary"

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" })

type OrderConfirmationProps = {
  order: WholesaleOrder
  onViewOrder: () => void
  onOpenOrders: () => void
  onStorefront: () => void
}

export function OrderConfirmation({ order, onViewOrder, onOpenOrders, onStorefront }: OrderConfirmationProps) {
  return (
    <main className="order-page confirmation-page">
      <div className="print-brand"><img src="/paki/logo.webp" alt="Paki Toys" /><span>Resumo comercial de demonstração</span></div>
      <header className="order-page__topbar no-print">
        <button className="checkout-brand" type="button" onClick={onStorefront} aria-label="Voltar à Paki Toys"><img src="/paki/logo.webp" alt="" /><span>Portal do lojista</span></button>
        <button className="text-button" type="button" onClick={onOpenOrders}>Meus pedidos</button>
      </header>

      <section className="confirmation-hero">
        <span className="confirmation-mark" aria-hidden="true">✓</span>
        <span className="section-kicker">Pedido recebido</span>
        <RetailerTierBadge />
        <h1>A brincadeira já começou.</h1>
        <p>Sua solicitação foi salva para demonstração. A equipe comercial validaria estoque, frete e condições antes de aprovar uma compra real.</p>
        <div className="confirmation-reference"><span>Referência do pedido</span><strong>{order.reference}</strong><small>{dateTime.format(new Date(order.createdAt))}</small></div>
      </section>

      <div className="confirmation-layout">
        <section className="confirmation-next">
          <span className="section-kicker">O que acontece agora?</span>
          <h2>Análise clara, passo a passo</h2>
          <ol>
            <li><span>1</span><div><strong>Cadastro e estoque</strong><p>A Paki confere os dados da loja e a disponibilidade das caixas.</p></div></li>
            <li><span>2</span><div><strong>{order.freight?.title ?? "Frete sob consulta"}</strong><p>{order.freight ? `${order.freight.estimate} · ${currency.format(order.freight.price)} em valores de demonstração.` : "A rota e o valor de entrega seriam confirmados."}</p></div></li>
            <li><span>3</span><div><strong>Condição comercial</strong><p>Sua preferência de {paymentTermLabel(order.paymentTerm).toLowerCase()} passa por validação.</p></div></li>
          </ol>
          <div className="demo-disclaimer"><strong>Demonstração:</strong> nenhum pedido real, cobrança ou reserva de estoque foi criado.</div>
          <div className="confirmation-actions no-print">
            <button className="button button--red" type="button" onClick={onViewOrder}>Acompanhar pedido</button>
            <button className="button button--ghost" type="button" onClick={() => window.print()}>Baixar / imprimir resumo</button>
            <button className="button button--ghost" type="button" onClick={onStorefront}>Continuar comprando</button>
          </div>
        </section>
        <OrderSummary orderLines={order.lines} totals={order.totals} commercialTotals={order.commercialTotals} freightTitle={order.freight?.title} compact />
      </div>
    </main>
  )
}
