import type { Category } from "../domain/catalog"

type CategoryRailProps = {
  categories: Category[]
  activeCategory: string
  onSelect: (handle: string) => void
}

const symbols: Record<string, string> = {
  jogos: "△",
  motora: "✣",
  "monta-e-roda": "◉",
  senninha: "⚑",
  "turma-da-monica": "♥",
}

export function CategoryRail({ categories, activeCategory, onSelect }: CategoryRailProps) {
  return (
    <section className="category-section" aria-labelledby="category-title">
      <div className="shell">
        <div className="section-heading section-heading--split">
          <div>
            <span className="section-kicker">Escolha a brincadeira</span>
            <h2 id="category-title">Um mundo para cada curiosidade</h2>
          </div>
          <button className={`category-all ${activeCategory === "all" ? "is-active" : ""}`} type="button" onClick={() => onSelect("all")} aria-pressed={activeCategory === "all"}>Ver todos</button>
        </div>
        <div className="category-rail">
          {categories.map((category, index) => (
            <button
              className={`category-card category-card--${category.accent} ${activeCategory === category.handle ? "is-active" : ""}`}
              type="button"
              key={category.handle}
              onClick={() => onSelect(category.handle)}
              aria-pressed={activeCategory === category.handle}
            >
              <span className="category-card__number">0{index + 1}</span>
              <span className="category-card__symbol" aria-hidden="true">{symbols[category.handle]}</span>
              <strong>{category.name}</strong>
              <span className="category-card__arrow" aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
