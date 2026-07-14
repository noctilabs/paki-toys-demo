import type { MinimumOrderProgress } from "../domain/commercial"

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

type MinimumOrderProgressViewProps = {
  progress: MinimumOrderProgress
}

export function MinimumOrderProgressView({ progress }: MinimumOrderProgressViewProps) {
  return (
    <section className={`minimum-progress ${progress.reached ? "is-reached" : ""}`} aria-label="Mínimo de pedido demonstrativo">
      <div>
        <strong>
          {progress.reached
            ? "Mínimo de demonstração alcançado"
            : `Faltam ${currency.format(progress.remaining)} para o mínimo de demonstração`}
        </strong>
        <span>{Math.round(progress.ratio * 100)}%</span>
      </div>
      <progress max={progress.minimum} value={Math.min(progress.current, progress.minimum)} />
      <small>Referência ilustrativa: {currency.format(progress.minimum)} em mercadorias. Não bloqueia o envio.</small>
    </section>
  )
}
