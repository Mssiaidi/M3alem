import { useEffect, useState } from 'react'
import { Link, Route, Routes, useLocation, useParams } from 'react-router-dom'
import HomePage from './components/HomePage'
import PageView from './components/PageView'
import StaticPage from './components/StaticPage'
import LoadingState from './components/LoadingState'
import NotFound from './components/NotFound'
import {
  CartPage,
  CataloguePage,
  CheckoutPage,
  LoginPage,
  OrderDetailPage,
  OrdersPage,
  ProductDetailPage,
  RegisterPage,
  ShopDetailPage,
} from './components/ShopPages'
import { getPage } from './lib/api'
import { pageCatalog, pageBySlug } from './data/pages'
import { staticPages } from './data/staticPages'
import './App.css'

function PageRoute() {
  const { slug } = useParams()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const localPage = staticPages[slug]
    if (localPage) {
      setPage(localPage)
      setLoading(false)
      return undefined
    }

    let active = true

    setLoading(true)
    getPage(slug)
      .then((data) => {
        if (active) setPage(data)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [slug])

  if (loading) return <LoadingState />

  if (pageBySlug[slug]) {
    return <StaticPage page={page} />
  }

  return <PageView page={page} />
}

function AllPages() {
  return (
    <section className="panel">
      <p className="eyebrow">Pages converties</p>
      <h2>Navigation complete</h2>
      <div className="grid">
        {pageCatalog.map((page) => (
          <Link className="card" key={page.slug} to={`/pages/${page.slug}`}>
            <span className="card__tag">/{page.slug}</span>
            <strong>{page.title}</strong>
            <span className="card__hint">{page.summary}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function Shell() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__inner">
          <Link to="/" className="brand">
            M3alem Marketplace
          </Link>

          <nav className="nav">
            <Link className={isHome ? 'is-active' : ''} to="/">
              Accueil
            </Link>
            <Link className={!isHome ? 'is-active' : ''} to="/pages/accueil">
              Pages
            </Link>
            <Link to="/catalogue">Catalogue</Link>
            <Link to="/orders">Commandes</Link>
          </nav>

          <div className="topbar__actions">
            <Link to="/cart" className="icon-button" aria-label="Panier">
              cart
            </Link>
            <Link to="/login" className="chip">Connexion</Link>
            <img
              className="avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDz6elkLbL52JF6stjvCQPFHlbSel1qmr0dArACO2NpZNlUsOHRy4Iz49McMNGiHTuEbT_Y5qVDKqLz3KSV5P-vuVPBJ_fdoNGzZMX_BED-fQUgAmm18hD4hSwiz3QDvc7Lyl6uO-hDDr5d1HlfENq8im3eZ3qnU_Ds6TPQLQ5NIRZMzzhWnWJPPma_CW9rQ51i_xf8c9hGDMPgvvxuV6sya26YeH1iVH8unFGrg7tlgzUd8lNykOtdUUHTuI2UJ6S-ZFH_aq8Umew"
              alt="Artisan Profile"
            />
          </div>
        </div>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<><HomePage /><AllPages /></>} />
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/shops/:slug" element={<ShopDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/pages/:slug" element={<PageRoute />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__top">
            <div className="footer__brand">
              <h4>M3alem Marketplace</h4>
              <p>
                La plateforme de reference pour l'artisanat marocain authentique
                et moderne.
              </p>
            </div>

            <div className="footer__links">
              <div>
                <h5>Place de marche</h5>
                <a href="#about">About Artisans</a>
                <br />
                <a href="#quality">Quality Standards</a>
                <br />
                <a href="#policy">Seller Policy</a>
              </div>

              <div>
                <h5>Support</h5>
                <a href="#support">Support</a>
                <br />
                <a href="#contact">Contact</a>
                <br />
                <a href="#shipping">Livraison</a>
              </div>
            </div>
          </div>

          <div className="footer__bottom">
            <p>(c) 2024 M3alem Marketplace. Professional Artisan Commerce.</p>
            <div className="footer__icons">
              <span className="icon-button" aria-hidden="true">
                lang
              </span>
              <span className="icon-button" aria-hidden="true">
                share
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Shell
