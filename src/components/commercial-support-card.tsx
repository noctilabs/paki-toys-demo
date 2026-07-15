import { useState } from "react"

export function CommercialSupportCard() {
  const [expanded, setExpanded] = useState(false)

  return (
    <aside className="commercial-support">
      <div>
        <span className="section-kicker">Apoio ao lojista</span>
        <h3>Equipe comercial Paki</h3>
        <p>Tire dúvidas sobre volumes, entrega e condições antes da análise.</p>
      </div>
      <button className="text-button" type="button" aria-expanded={expanded} onClick={() => setExpanded((current) => !current)}>
        {expanded ? "Fechar orientação" : "Como funciona o atendimento?"}
      </button>
      {expanded && (
        <p className="commercial-support__message" role="status">
          Em uma implementação real, sua solicitação seria encaminhada ao representante responsável pela sua conta.
        </p>
      )}
    </aside>
  )
}
