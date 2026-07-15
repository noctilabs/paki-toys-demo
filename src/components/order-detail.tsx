import type { WholesaleOrder } from "../domain/checkout"
import { orderStatusSteps, paymentTermLabel } from "../services/checkout"
import { CommercialSupportCard } from "./commercial-support-card"
import { RetailerTierBadge } from "./commercial-badges"
import { OrderSummary } from "./order-summary"

const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" })

type OrderDetailProps = {
  order: WholesaleOrder
  reorderNotice: string
  onBack: () => void
  onReorder: () => void
  onStorefront: () => void
}

export function OrderDetail({ order, reorderNotice, onBack, onReorder, onStorefront }: OrderDetailProps) {
  const steps = orderStatusSteps(order.status)

  return (
    <main className="order-page order-document">
      <header className="order-page__topbar no-print">
        <button className="checkout-brand" type="button" onClick={onStorefront} aria-label="Voltar à Paki Toys"><img src="/paki/logo.webp" alt="" /><span>Portal do lojista</span></button>
        <button className="text-button" type="button" onClick={onBack}>← Voltar aos pedidos</button>
      </header>

      <section className="order-detail-heading">
        <div><span className="section-kicker">Pedido recebido</span><h1>{order.reference}</h1><p>Enviado em {dateTime.format(new Date(order.createdAt))}</p></div>
        <div className="order-detail-actions no-print"><button className="button button--ghost" type="button" onClick={() => window.print()}>Imprimir resumo</button><button className="button button--red" type="button" onClick={onReorder}>Comprar novamente</button></div>
      </section>

      {reorderNotice && <div className="order-notice" role="status">{reorderNotice}</div>}

      <section className="status-section" aria-labelledby="status-title">
        <div><span className="section-kicker">Acompanhamento</span><h2 id="status-title">Da análise à entrega</h2><p>Este pedido demonstra o fluxo completo. Apenas a etapa recebida está ativa.</p></div>
        <ol className="status-timeline">
          {steps.map((step) => (
            <li className={`is-${step.state}`} key={step.status}>
              <span aria-hidden="true">{step.state === "complete" ? "✓" : step.state === "current" ? "●" : ""}</span>
              <div><strong>{step.label}</strong><p>{step.description}</p><small>{step.state === "current" ? "Etapa atual" : step.state === "complete" ? "Concluída" : "Próxima etapa"}</small></div>
            </li>
          ))}
        </ol>
      </section>

      <div className="order-detail-grid">
        <div className="order-detail-info">
          <section><span className="section-kicker">Empresa</span><h2>{order.company.tradeName || order.company.legalName}</h2><RetailerTierBadge /><p>{order.company.legalName}<br />CNPJ {order.company.cnpj}{order.company.stateRegistration && <><br />IE {order.company.stateRegistration}</>}<br /><br /><strong>Comprador</strong><br />{order.company.buyerName}<br />{order.company.email}<br />{order.company.phone}</p></section>
          <section><span className="section-kicker">Entrega</span><h2>{order.delivery.city}/{order.delivery.state}</h2><p>{order.delivery.street}, {order.delivery.number}{order.delivery.complement && ` · ${order.delivery.complement}`}<br />{order.delivery.neighborhood}<br />CEP {order.delivery.postalCode}<br /><br /><strong>Recebimento</strong><br />{order.delivery.contactName}{order.delivery.instructions && <><br />{order.delivery.instructions}</>}</p></section>
          <section><span className="section-kicker">Condição</span><h2>{paymentTermLabel(order.paymentTerm)}</h2><p>Preferência registrada para análise. Não representa aprovação de crédito ou cobrança.</p><span className="freight-chip">{order.freight ? `${order.freight.title} · ${order.freight.estimate}` : "Frete sob consulta"}</span></section>
          <CommercialSupportCard />
        </div>
        <OrderSummary orderLines={order.lines} totals={order.totals} commercialTotals={order.commercialTotals} freightTitle={order.freight?.title} />
      </div>

      <footer className="order-document__footer"><img src="/paki/logo.webp" alt="Paki Toys" /><p>Resumo de demonstração · nenhum pedido real foi criado.</p><strong>{order.reference}</strong></footer>
    </main>
  )
}
