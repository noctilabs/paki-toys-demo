import { demoCommercialPolicy } from "../data/demo-commercial-policy"

type VolumeTierTableProps = {
  activeBoxCount: number
}

function boxRange(minBoxes: number, maxBoxes?: number) {
  if (maxBoxes === undefined) return `${minBoxes}+ caixas`
  return minBoxes === maxBoxes ? `${minBoxes} caixa` : `${minBoxes}–${maxBoxes} caixas`
}

export function VolumeTierTable({ activeBoxCount }: VolumeTierTableProps) {
  return (
    <div className="volume-tier-table">
      <div className="volume-tier-table__heading">
        <strong>Condição por volume</strong>
        <span>Simulação comercial</span>
      </div>
      <table>
        <thead><tr><th scope="col">Caixas</th><th scope="col">Condição</th></tr></thead>
        <tbody>
          {demoCommercialPolicy.tiers.map((tier) => {
            const active = activeBoxCount >= tier.minBoxes
              && (tier.maxBoxes === undefined || activeBoxCount <= tier.maxBoxes)
            return (
              <tr key={tier.minBoxes} className={active ? "is-active" : ""}>
                <td>{boxRange(tier.minBoxes, tier.maxBoxes)}</td>
                <td><strong>{tier.label}</strong>{active && <span>Condição atual</span>}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
