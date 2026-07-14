import { SparkIcon } from "./icons"

const values = [
  { number: "01", title: "Imaginação sem limites", copy: "Cada peça vira uma história nova — criada por quem mais entende de brincar." },
  { number: "02", title: "Aprendizado que acontece", copy: "Cores, formas, palavras e desafios que acompanham cada fase da infância." },
  { number: "03", title: "Diversão fora das telas", copy: "Mais encontros, movimento e descobertas compartilhadas de verdade." },
]

export function ValueStrip() {
  return (
    <section className="values-section" id="por-que-paki" aria-labelledby="values-title">
      <div className="shell values-section__inner">
        <div className="values-intro">
          <span className="section-kicker section-kicker--light"><SparkIcon /> Por que Paki?</span>
          <h2 id="values-title">Brinquedo bom é aquele que continua na memória.</h2>
          <p>Desenvolvemos experiências que respeitam o tempo da criança e transformam o cotidiano em aventura.</p>
        </div>
        <div className="values-list">
          {values.map((value) => (
            <article key={value.number}>
              <span>{value.number}</span>
              <div><h3>{value.title}</h3><p>{value.copy}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
