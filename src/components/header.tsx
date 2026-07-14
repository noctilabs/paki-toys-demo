import { BagIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon } from "./icons"

type HeaderProps = {
  query: string
  onQueryChange: (value: string) => void
  favoriteCount: number
  cartCount: number
  cartOpen: boolean
  onCartOpen: () => void
  onOrdersOpen: () => void
  mobileMenuOpen: boolean
  onMobileMenuToggle: () => void
}

const navigation = [
  { label: "Brinquedos", href: "#produtos" },
  { label: "Por que Paki?", href: "#por-que-paki" },
  { label: "Para lojistas", href: "#lojistas" },
]

export function Header({
  query,
  onQueryChange,
  favoriteCount,
  cartCount,
  cartOpen,
  onCartOpen,
  onOrdersOpen,
  mobileMenuOpen,
  onMobileMenuToggle,
}: HeaderProps) {
  return (
    <>
      <div className="announcement">
        <span>Feito para imaginar, aprender e brincar</span>
        <span className="announcement__dot" aria-hidden="true" />
        <a href="#lojistas">Encontre Paki Toys nas melhores lojas</a>
      </div>
      <header className="site-header">
        <div className="shell site-header__inner">
          <a className="brand" href="#top" aria-label="Paki Toys — início">
            <img src="/paki/logo.webp" alt="Paki Toys" />
          </a>

          <nav className="desktop-nav" aria-label="Navegação principal">
            {navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          </nav>

          <div className="header-actions">
            <label className="search-control">
              <span className="sr-only">Buscar brinquedos</span>
              <SearchIcon />
              <input
                type="search"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Buscar brinquedo"
              />
            </label>
            <button className="orders-link desktop-only" type="button" onClick={onOrdersOpen}>Meus pedidos</button>
            <a className="icon-button desktop-only" href="#produtos" aria-label={`${favoriteCount} brinquedos favoritos`}>
              <HeartIcon filled={favoriteCount > 0} />
              {favoriteCount > 0 && <span className="count-badge">{favoriteCount}</span>}
            </a>
            <button className="icon-button" type="button" onClick={onCartOpen} aria-label={`Abrir sacola com ${cartCount} caixas`} aria-expanded={cartOpen}>
              <BagIcon />
              {cartCount > 0 && <span className="count-badge">{cartCount}</span>}
            </button>
            <button className="icon-button mobile-toggle" type="button" onClick={onMobileMenuToggle} aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={mobileMenuOpen}>
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="mobile-nav" aria-label="Navegação móvel">
            {navigation.map((item) => <a key={item.href} href={item.href} onClick={onMobileMenuToggle}>{item.label}</a>)}
            <button type="button" onClick={() => { onMobileMenuToggle(); onOrdersOpen() }}>Meus pedidos</button>
          </nav>
        )}
      </header>
    </>
  )
}
