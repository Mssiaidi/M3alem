import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { deleteProduct, getSellerProducts } from '../../api/sellerService'

function formatMoney(value) {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function getProductImage(product) {
  return product?.images?.[0]?.path || 'https://via.placeholder.com/900x600?text=M3alem'
}

function SellerProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const location = useLocation()
  const [toast, setToast] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const items = await getSellerProducts()
        if (!active) return
        setProducts(items)
      } catch (err) {
        if (!active) return
        setError(err.message || 'Impossible de charger les produits.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const message = location.state?.toast
    if (!message) return undefined

    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
    window.history.replaceState({}, '', '/seller/products')
    return undefined
  }, [location.state])

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!event.target.closest('.seller-product-card__menu')) {
        setOpenMenuId(null)
      }
      if (!event.target.closest('.seller-products-filter')) {
        setFiltersOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  async function handleDelete(product) {
    const confirmed = window.confirm(`Supprimer ${product.name} ?`)
    if (!confirmed) return

    try {
      await deleteProduct(product.id)
      setProducts((current) => current.filter((item) => item.id !== product.id))
      setOpenMenuId(null)
    } catch (err) {
      setError(err.message || 'Impossible de supprimer le produit.')
    }
  }

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase()

    return products.filter((product) => {
      const stock = Number(product.stock || 0)
      const isLow = stock > 0 && stock <= 5
      const isOut = stock === 0
      const matchesQuery =
        needle === '' ||
        product.name?.toLowerCase().includes(needle) ||
        product.description?.toLowerCase().includes(needle) ||
        product.category?.name?.toLowerCase().includes(needle)

      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'active' && product.is_active) ||
        (activeFilter === 'low' && isLow) ||
        (activeFilter === 'out' && isOut) ||
        (activeFilter === 'draft' && !product.is_active)

      return matchesQuery && matchesFilter
    })
  }, [activeFilter, products, query])

  const summary = useMemo(() => {
    const total = products.length
    const stockValues = products.map((product) => Number(product.stock || 0))
    const lowStock = stockValues.filter((stock) => stock > 0 && stock <= 5).length
    const outOfStock = stockValues.filter((stock) => stock === 0).length
    const activeProducts = products.filter((product) => product.is_active).length
    const totalValue = products.reduce((sum, product) => sum + Number(product.price || 0), 0)

    return {
      total,
      lowStock,
      outOfStock,
      activeProducts,
      totalValue,
    }
  }, [products])

  return (
    <div className="seller-products-page">
      {toast ? <div className="app-toast">{toast}</div> : null}
      <section className="seller-products-hero">
        <div className="seller-products-hero__copy">
          <span className="seller-products-eyebrow">Espace vendeur</span>
          <h1>Inventaire des produits</h1>
          <p>
            Gérez vos créations artisanales avec une vue claire sur les stocks, les prix et les
            produits publiés.
          </p>

          <div className="seller-products-actions">
            <button
              className="button--ghost button--ghost-dark seller-products-filter__button"
              type="button"
              onClick={() => setFiltersOpen((current) => !current)}
            >
              <span className="material-symbols-outlined">filter_list</span>
              Filtres
            </button>
            <Link className="button seller-products-actions__primary" to="/seller/products/new">
              <span className="material-symbols-outlined">add_circle</span>
              Ajouter un produit
            </Link>
            <div className={`seller-products-filter ${filtersOpen ? 'is-open' : ''}`}>
              <div className="seller-products-filter__panel">
                <button type="button" onClick={() => setActiveFilter('all')}>
                  Tous les produits
                </button>
                <button type="button" onClick={() => setActiveFilter('active')}>
                  Produits publiés
                </button>
                <button type="button" onClick={() => setActiveFilter('low')}>
                  Stock faible
                </button>
                <button type="button" onClick={() => setActiveFilter('out')}>
                  Rupture de stock
                </button>
                <button type="button" onClick={() => setActiveFilter('draft')}>
                  Brouillons
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="seller-products-hero__panel">
          <article className="seller-kpi-card seller-kpi-card--soft">
            <span>Total produits</span>
            <strong>{summary.total}</strong>
            <small>Depuis la base de données</small>
          </article>
          <article className="seller-kpi-card seller-kpi-card--soft">
            <span>Produits actifs</span>
            <strong>{summary.activeProducts}</strong>
            <small>Visibles dans la boutique</small>
          </article>
          <article className="seller-kpi-card seller-kpi-card--alert">
            <span>Alertes stock</span>
            <strong>{String(summary.lowStock).padStart(2, '0')}</strong>
            <small>{summary.outOfStock} en rupture</small>
          </article>
          <article className="seller-kpi-card seller-kpi-card--accent">
            <span>Valeur catalogue</span>
            <strong>{formatMoney(summary.totalValue)}</strong>
            <small>Somme des produits chargés</small>
          </article>
        </div>
      </section>

      <section className="seller-products-toolbar">
        <div className="seller-products-search">
          <label>
            <span>Rechercher</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nom, catégorie ou description..."
              type="search"
              value={query}
            />
          </label>
          <div className="seller-products-pills" aria-label="Filtres produits">
            <span className="seller-products-pills__label">Filtre actif:</span>
            <strong className="seller-products-pills__value">
              {activeFilter === 'all'
                ? 'Tous'
                : activeFilter === 'active'
                  ? 'Publiés'
                  : activeFilter === 'low'
                    ? 'Stock faible'
                    : activeFilter === 'out'
                      ? 'Rupture'
                      : 'Brouillons'}
            </strong>
          </div>
        </div>
      </section>

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p className="muted">Chargement des produits...</p> : null}

      {!loading && !error && filteredProducts.length === 0 ? (
        <section className="seller-products-empty">
          <h2>Aucun produit trouvé</h2>
          <p>Essaie de changer le filtre ou crée ton premier produit pour remplir l’inventaire.</p>
          <Link className="button" to="/seller/products/new">
            <span className="material-symbols-outlined">add</span>
            Nouveau produit
          </Link>
        </section>
      ) : null}

      <section className="seller-products-grid">
        {filteredProducts.map((product, index) => {
          const stock = Number(product.stock || 0)
          const image = getProductImage(product)
          const badge =
            stock === 0
              ? 'RUPTURE DE STOCK'
              : stock <= 5
                ? 'STOCK FAIBLE'
                : product.is_active
                  ? 'EN VENTE'
                  : 'BROUILLON'
          const category = product.category?.name || 'Sans catégorie'
          const editPath = `/seller/products/${product.id}/edit`

          return (
            <article
              className={`seller-product-card ${stock === 0 ? 'is-out' : ''}`}
              key={product.id}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="seller-product-card__media">
                <img alt={product.name} src={image} />
                <span className="seller-product-card__badge">{badge}</span>
                <span className="seller-product-card__category">{category}</span>
                {stock === 0 ? <div className="seller-product-card__overlay">RUPTURE DE STOCK</div> : null}
              </div>

              <div className="seller-product-card__body">
                <div className="seller-product-card__title-row">
                  <h2>{product.name}</h2>
                  <strong>{formatMoney(product.price)}</strong>
                </div>
                <p>{product.description || 'Produit artisanal avec description de démonstration.'}</p>

                <div className="seller-product-card__meta">
                  <span>
                    {stock === 0
                      ? 'Re-stockage nécessaire'
                      : `${stock} unité${stock > 1 ? 's' : ''} ${stock <= 5 ? 'restantes' : 'en stock'}`}
                  </span>
                  <div className="seller-product-card__actions">
                    <Link to={editPath} className="icon-link" aria-label={`Modifier ${product.name}`}>
                      <span className="material-symbols-outlined">edit</span>
                    </Link>
                    <button
                      className="icon-link"
                      type="button"
                      aria-label={`Plus d'actions pour ${product.name}`}
                      onClick={() =>
                        setOpenMenuId((current) => (current === product.id ? null : product.id))
                      }
                    >
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </div>
                </div>

                {stock === 0 ? (
                  <div className="seller-product-card__restock">
                    <span>Re-stockage nécessaire</span>
                    <button className="button button--small" type="button">
                      <span className="material-symbols-outlined">inventory_2</span>
                      Réapprovisionner
                    </button>
                  </div>
                ) : null}

                {openMenuId === product.id ? (
                  <div className="seller-product-card__menu">
                  <Link to={editPath} className="seller-product-card__menu-item">
                    <span className="material-symbols-outlined">edit</span>
                    Modifier
                  </Link>
                    <Link to={`/products/${product.slug}`} className="seller-product-card__menu-item">
                      <span className="material-symbols-outlined">visibility</span>
                      Voir
                    </Link>
                    <button
                      className="seller-product-card__menu-item seller-product-card__menu-item--danger"
                      type="button"
                      onClick={() => handleDelete(product)}
                    >
                      <span className="material-symbols-outlined">delete</span>
                      Supprimer
                    </button>
                  </div>
                ) : null}
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}

export default SellerProducts
