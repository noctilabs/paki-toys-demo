import { useState, type FormEvent } from "react"
import { ArrowIcon, SparkIcon } from "./icons"

export function Promotion() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  function submitDemo(event: FormEvent) {
    event.preventDefault()
    setMessage("Pronto! Na versão final, as novidades chegariam por aqui.")
    setEmail("")
  }

  return (
    <>
      <section className="retailer-section" id="lojistas" aria-labelledby="retailer-title">
        <div className="shell retailer-section__inner">
          <div className="retailer-copy">
            <span className="section-kicker section-kicker--light"><SparkIcon /> Para lojistas</span>
            <h2 id="retailer-title">Brinquedos que chamam atenção — e giram na prateleira.</h2>
            <p>Um catálogo pensado para facilitar a descoberta das linhas, idades, códigos e condições comerciais Paki Toys.</p>
            <a className="button button--cream" href="mailto:comercial@pakitoys.com.br?subject=Quero%20conhecer%20o%20catálogo%20Paki%20Toys">Falar com o comercial <ArrowIcon /></a>
          </div>
          <div className="retailer-products" aria-hidden="true">
            <div><img src="/paki/products/1544-clikt-100-pecas.webp" alt="" /></div>
            <div><img src="/paki/products/2082-senninha-jogo-4-em-linha.webp" alt="" /></div>
            <span>Catálogo<br /><strong>2026</strong></span>
          </div>
        </div>
      </section>

      <section className="newsletter" aria-labelledby="newsletter-title">
        <div className="shell newsletter__inner">
          <div><span className="section-kicker">Novidades Paki</span><h2 id="newsletter-title">Uma dose de brincadeira na sua caixa de entrada.</h2></div>
          <form onSubmit={submitDemo}>
            <label>
              <span className="sr-only">Seu melhor e-mail</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Seu melhor e-mail" required />
            </label>
            <button type="submit" aria-label="Cadastrar e-mail na demonstração"><ArrowIcon /></button>
            {message && <p role="status">{message}</p>}
          </form>
        </div>
      </section>
    </>
  )
}
