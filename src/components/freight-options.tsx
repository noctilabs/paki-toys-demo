import { demoCommercialPolicy } from "../data/demo-commercial-policy"
import type { FreightOption } from "../domain/commercial"

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

type FreightOptionsProps = {
  value: FreightOption["id"] | ""
  error?: string
  onChange: (value: FreightOption["id"]) => void
}

export function FreightOptions({ value, error, onChange }: FreightOptionsProps) {
  const descriptionId = "freight-demo-description"
  const errorId = "freightOptionId-error"

  return (
    <fieldset className="freight-options" aria-describedby={`${descriptionId}${error ? ` ${errorId}` : ""}`}>
      <legend>Opção de entrega</legend>
      <p id={descriptionId}>Valores e prazos de demonstração</p>
      <div className="freight-options__grid">
        {demoCommercialPolicy.freightOptions.map((option) => (
          <label className={value === option.id ? "freight-card is-selected" : "freight-card"} key={option.id}>
            <input
              type="radio"
              name="freightOptionId"
              data-field="freightOptionId"
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
            />
            <span><strong>{option.title}</strong><b>{currency.format(option.price)}</b></span>
            <em>{option.estimate}</em>
            <small>{option.description}</small>
          </label>
        ))}
      </div>
      {error && <p id={errorId} className="field-error" role="alert">{error}</p>}
    </fieldset>
  )
}
