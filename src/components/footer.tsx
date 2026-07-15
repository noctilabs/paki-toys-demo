export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer__grid">
        <div className="footer__brand">
          <img src="/paki/logo.webp" alt="Paki Toys" />
          <p>Brinquedos inteligentes e educativos para imaginar, aprender e brincar.</p>
          <span>Desde 1994 criando boas histórias.</span>
        </div>
        <div><h2>Descubra</h2><a href="#produtos">Todos os brinquedos</a><a href="#produtos">Jogos educativos</a><a href="#produtos">Coordenação motora</a><a href="#produtos">Monta & Roda</a></div>
        <div><h2>Paki Toys</h2><a href="#por-que-paki">Nossa história</a><a href="https://pakitoys.com.br/downloads/">Downloads</a><a href="https://pakitoys.com.br/contato/">Contato</a><a href="#lojistas">Seja um lojista</a></div>
        <div>
          <h2>Vamos conversar?</h2>
          <a href="mailto:comercial@pakitoys.com.br">comercial@pakitoys.com.br</a>
          <p>Segunda a sexta<br />8h às 17h</p>
          <div className="social-row"><a href="https://pakitoys.com.br/" aria-label="Site oficial Paki Toys">www</a><a href="https://www.instagram.com/pakitoys/" aria-label="Instagram Paki Toys">ig</a></div>
        </div>
      </div>
      <div className="shell footer__bottom">
        <div><span>© 2026 Paki Toys. Demonstração de experiência digital.</span><small className="footer__credit">Conceito digital por NoctiLabs</small></div>
        <a href="#top">Voltar ao topo ↑</a>
      </div>
    </footer>
  )
}
