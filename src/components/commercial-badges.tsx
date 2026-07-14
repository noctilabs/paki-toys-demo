type AvailabilityBadgeProps = {
  availableBoxes?: number
  underReview?: boolean
  demoLabel?: boolean
}

export function AvailabilityBadge({
  availableBoxes,
  underReview = false,
  demoLabel = true,
}: AvailabilityBadgeProps) {
  const showReview = underReview || availableBoxes === undefined

  return (
    <span className={`availability-badge ${showReview ? "availability-badge--review" : ""}`}>
      <span className="availability-badge__dot" aria-hidden="true" />
      {showReview ? "Disponibilidade sob consulta" : `${availableBoxes} caixas disponíveis`}
      {demoLabel && <span className="sr-only">. Dados de demonstração.</span>}
    </span>
  )
}

export function RetailerTierBadge() {
  return (
    <span className="retailer-tier">
      Parceiro Ouro
      <span className="sr-only">. Dados de demonstração.</span>
    </span>
  )
}
