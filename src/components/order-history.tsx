import type { WholesaleOrder } from "../domain/checkout"

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" })

type OrderHistoryProps = {
  orders: WholesaleOrder[]
  loading: boolean
  error: string
  onOpenOrder: (order: WholesaleOrder) => void
  onStorefront: () => void
}

export function OrderHistory({ orders, loading, error, onOpenOrder, onStorefront }: OrderHistoryProps) {
  return (
    <main className="order-page">
      <header className="order-page__topbar">
        <button className="checkout-brand" type="button" onClick={onStorefront} aria-label="Voltar à Paki Toys"><img src="/paki/logo.webp" alt="" /><span>Portal do lojista</span></button>
        <button className="button button--ghost" type="button" onClick={onStorefront}>Voltar à loja</button>
      </header>

      <section className="orders-heading">
        <div><span className="section-kicker">Área do lojista</span><h1>Meus pedidos</h1><p>Solicitações simuladas salvas neste navegador.</p></div>
        <span className="demo-pill">Demo local · sem login</span>
      </section>

      {loading && <div className="orders-state" role="status"><span className="orders-loader" aria-hidden="true" /><h2>Carregando pedidos…</h2></div>}
      {error && <div className="orders-state orders-state--error" role="alert"><span>!</span><h2>Não foi possível abrir o histórico</h2><p>{error}</p></div>}
      {!loading && !error && orders.length === 0 && (
        <div className="orders-state"><span aria-hidden="true">PK</span><h2>Sua prateleira de pedidos está vazia</h2><p>Finalize uma solicitação de compra e ela aparecerá aqui neste navegador.</p><button className="button button--blue" type="button" onClick={onStorefront}>Escolher brinquedos</button></div>
      )}

      {!loading && !error && orders.length > 0 && (
        <section className="orders-list" aria-label="Pedidos salvos">
          {orders.map((order) => (
            <button className="order-card" type="button" key={order.id} onClick={() => onOpenOrder(order)}>
              <div className="order-card__reference"><span>Pedido</span><strong>{order.reference}</strong><small>{date.format(new Date(order.createdAt))}</small></div>
              <div><span>Empresa</span><strong>{order.company.tradeName || order.company.legalName}</strong><small>{order.company.legalName}</small></div>
              <div><span>Volumes</span><strong>{order.totals.boxCount} {order.totals.boxCount === 1 ? "caixa" : "caixas"}</strong><small>{order.totals.unitCount} unidades</small></div>
              <div><span>Total estimado</span><strong>{currency.format(order.commercialTotals?.estimatedTotal ?? order.totals.merchandiseSubtotal)}</strong><small>{order.freight?.title ?? "Frete sob consulta"}</small></div>
              <div className="order-card__status"><i aria-hidden="true" /><span>Pedido recebido</span><b aria-hidden="true">→</b></div>
            </button>
          ))}
        </section>
      )}
    </main>
  )
}
