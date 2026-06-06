import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSellerProducts } from '../../api/sellerService'

function formatMoney(value) {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function SellerProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  const summary = {
    total: products.length,
    sales: 2840,
    lowStock: products.filter((product) => Number(product.stock) > 0 && Number(product.stock) <= 5)
      .length,
    avgRating: 4.9,
  }

  return (
    <div className="seller-products-shell">
      <section className="seller-products-top">
        <article className="seller-kpi-card">
          <span>Total produits</span>
          <strong>{summary.total}</strong>
        </article>
        <article className="seller-kpi-card">
          <span>Ventes du mois</span>
          <strong>{formatMoney(summary.sales)}</strong>
        </article>
        <article className="seller-kpi-card seller-kpi-card--alert">
          <span>Alertes stock</span>
          <strong>{String(summary.lowStock).padStart(2, '0')}</strong>
          <small>Action requise</small>
        </article>
        <article className="seller-kpi-card">
          <span>Note artisan</span>
          <strong>
            {summary.avgRating}
            <span className="seller-kpi-star">★</span>
          </strong>
        </article>
      </section>

      <section className="seller-products-toolbar">
        <div>
          <h1>Inventaire des Produits</h1>
          <p>Gérez vos créations artisanales et surveillez vos niveaux de stock.</p>
        </div>
        <div className="action-row">
          <button className="button--ghost button--ghost-dark" type="button">
            Filtres
          </button>
          <Link className="button" to="/seller/products/new">
            Ajouter un produit
          </Link>
        </div>
      </section>

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p className="muted">Chargement des produits...</p> : null}

      <section className="seller-products-grid">
        {products.map((product) => {
          const stock = Number(product.stock || 0)
          const image = product.images?.[0]?.path || 'https://via.placeholder.com/600x400?text=M3alem'
          const badge =
            stock === 0 ? 'RUPTURE DE STOCK' : stock <= 5 ? 'STOCK FAIBLE' : product.is_active ? 'EN VENTE' : 'BROUILLON'
          const category = product.category?.name || 'Sans catégorie'
          const editPath = `/seller/products/${product.id}/edit`

          return (
            <article className={`seller-product-card ${stock === 0 ? 'is-out' : ''}`} key={product.id}>
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
                  <span>{stock === 0 ? 'Re-stockage nécessaire' : `${stock} unités ${stock <= 5 ? 'restantes' : 'en stock'}`}</span>
                  <div className="seller-product-card__actions">
                    <Link to={editPath} className="icon-link" aria-label={`Modifier ${product.name}`}>
                      ✎
                    </Link>
                    <button className="icon-link" type="button" aria-label={`Plus d'actions pour ${product.name}`}>
                      ⋮
                    </button>
                  </div>
                </div>

                {stock === 0 ? (
                  <div className="seller-product-card__restock">
                    <span>Re-stockage nécessaire</span>
                    <button className="button button--small" type="button">
                      Réapprovisionner
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
