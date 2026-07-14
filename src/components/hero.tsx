import { ArrowIcon, SparkIcon } from "./icons"

type HeroProps = {
  onExplore: () => void
}

export function Hero({ onExplore }: HeroProps) {
  return (
    <section className="hero" id="top">
      <div className="hero__pattern" aria-hidden="true" />
      <div className="shell hero__inner">
        <div className="hero__copy">
          <div className="eyebrow"><SparkIcon /> Brincadeiras que fazem crescer</div>
          <h1>Brincar faz a <em>imaginação</em> decolar.</h1>
          <p>Brinquedos inteligentes, coloridos e cheios de possibilidades para cada nova descoberta.</p>
          <div className="hero__actions">
            <button className="button button--red" type="button" onClick={onExplore}>Ver brinquedos <ArrowIcon /></button>
            <a className="text-link" href="#por-que-paki">Conheça a Paki <span aria-hidden="true">↘</span></a>
          </div>
          <div className="hero__proof">
            <div className="proof-faces" aria-hidden="true"><span>☺</span><span>★</span><span>♥</span></div>
            <p><strong>+ de 30 anos</strong><br />criando momentos felizes</p>
          </div>
        </div>

        <div className="hero__playground" aria-label="Destaques Paki Toys">
          <div className="orbit orbit--one" aria-hidden="true" />
          <div className="orbit orbit--two" aria-hidden="true" />
          <div className="toy-card toy-card--main">
            <span className="toy-card__tag">Monta & Roda</span>
            <img src="/paki/products/1214-dino-truck.webp" alt="Dino Truck Paki Toys" />
          </div>
          <div className="toy-card toy-card--top">
            <img src="/paki/products/4115-bingo-alfabeto.webp" alt="Bingo Alfabeto Paki Toys" />
          </div>
          <div className="toy-card toy-card--bottom">
            <img src="/paki/products/3055-maleta-de-ferramentas-tdm.webp" alt="Maleta de Ferramentas Turma da Mônica" />
          </div>
          <div className="hero-sticker hero-sticker--age">+3<br /><small>anos</small></div>
          <div className="hero-sticker hero-sticker--fun">100%<br /><small>diversão</small></div>
          <span className="doodle doodle--star" aria-hidden="true">✦</span>
          <span className="doodle doodle--squiggle" aria-hidden="true">〰</span>
        </div>
      </div>
      <div className="hero__ticker" aria-hidden="true">
        <span>IMAGINAR</span><b>✦</b><span>APRENDER</span><b>✦</b><span>CRIAR</span><b>✦</b><span>BRINCAR</span><b>✦</b><span>COMPARTILHAR</span>
      </div>
    </section>
  )
}
