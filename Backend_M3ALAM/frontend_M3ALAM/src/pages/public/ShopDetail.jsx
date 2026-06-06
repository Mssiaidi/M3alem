import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getShop } from '../../api/catalogService'

function formatPrice(price) {
  return `${Number(price || 0).toLocaleString('fr-FR')} DH`
}

function formatRating(value) {
  if (!value) return null
  return Number(value).toFixed(1)
}

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function ShopDetail() {
  const { slug } = useParams()
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    getShop(slug)
      .then((data) => {
        if (active) setShop(data)
      })
      .catch(() => {
        if (active) setError('Boutique introuvable ou indisponible.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [slug])

  const rating = formatRating(shop?.rating_avg)
  const categories = useMemo(() => shop?.categories || [], [shop])
  const products = shop?.products || []
  const reviews = shop?.reviews || []

  if (loading) return <p className="muted">Chargement de la boutique...</p>
  if (error) return <p className="panel panel--error">{error}</p>
  if (!shop) return null

  return (
    <article className="shop-detail-page">
      <nav className="product-breadcrumb" aria-label="Fil d'Ariane">
        <Link to="/">Accueil</Link>
        <span>&gt;</span>
        <Link to="/catalogue">Catalogue</Link>
        <span>&gt;</span>
        <strong>{shop.name}</strong>
      </nav>

      <section className="shop-identity">
        {shop.cover_image && (
          <div className="shop-identity__cover">
            <img src={shop.cover_image} alt={`Atelier ${shop.name}`} />
          </div>
        )}

        <div className="shop-identity__content">
          {shop.logo_image && (
            <div className="shop-identity__logo">
              <img src={shop.logo_image} alt={`Logo ${shop.name}`} />
            </div>
          )}

          <div className="shop-identity__main">
            <div>
              <div className="shop-identity__title">
                <h1>{shop.name}</h1>
                {shop.status === 'approved' && <span className="pill pill--warning">Boutique certifiee</span>}
              </div>
              <p>
                {shop.user?.name && <span>{shop.user.name}</span>}
                {shop.city && <span> · {shop.city}, Maroc</span>}
              </p>
              {rating && (
                <div className="shop-identity__rating">
                  <span aria-hidden="true">★</span>
                  <strong>{rating}</strong>
                  <span>{shop.reviews_count} avis</span>
                </div>
              )}
            </div>

            <div className="shop-identity__actions">
              <Link className="button--ghost button--ghost--dark" to="/login">Contacter</Link>
              <Link className="button" to="/catalogue">Voir catalogue</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="shop-detail-grid">
        <aside className="shop-sidebar">
          <section className="shop-panel">
            <h2>A propos</h2>
            {shop.description ? (
              <p>{shop.description}</p>
            ) : (
              <p className="muted">Aucune description disponible pour cette boutique.</p>
            )}

            <div className="shop-facts">
              {shop.city && <span>Localisation: {shop.city}</span>}
              {shop.member_since && <span>Membre depuis {shop.member_since}</span>}
              <span>{shop.products_count || products.length} produits disponibles</span>
            </div>
          </section>

          {categories.length > 0 && (
            <section className="shop-panel shop-categories">
              <h2>Categories</h2>
              <div>
                {categories.map((category) => (
                  <Link key={category.id} to={`/catalogue?category=${category.slug}`}>
                    {category.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="shop-panel shop-badge">
            <strong>Vendeur Elite</strong>
            <span>Produits authentiques</span>
            <span>Boutique validee</span>
          </section>
        </aside>

        <main className="shop-products-area">
          <div className="section__head">
            <h2>Produits de la boutique</h2>
            <p>{products.length} produit(s)</p>
          </div>

          {products.length > 0 ? (
            <div className="shop-products-grid">
              {products.map((product) => (
                <Link className="shop-product-card" key={product.id} to={`/products/${product.slug}`}>
                  <div className="shop-product-card__media">
                    {product.images?.[0] ? (
                      <img src={product.images[0].path} alt={product.images[0].alt_text || product.name} />
                    ) : (
                      <span>Image indisponible</span>
                    )}
                  </div>
                  <div className="shop-product-card__body">
                    <h3>{product.name}</h3>
                    <div>
                      <strong>{formatPrice(product.price)}</strong>
                      {formatRating(product.rating_avg) && <span>★ {formatRating(product.rating_avg)}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="muted">Aucun produit disponible pour cette boutique.</p>
          )}

          {reviews.length > 0 && (
            <section className="shop-reviews">
              <div className="section__head">
                <h2>Avis boutique</h2>
                <p>{reviews.length} avis recents</p>
              </div>
              <div className="review-grid">
                {reviews.map((review) => (
                  <article className="review-card" key={review.id}>
                    <div className="review-card__head">
                      <div className="review-card__user">
                        <span>{initials(review.user?.name)}</span>
                        <div>
                          <strong>{review.user?.name || 'Client'}</strong>
                          <small>Achat verifie</small>
                        </div>
                      </div>
                      <strong className="review-card__rating">★ {review.rating}</strong>
                    </div>
                    {review.comment && <p>{review.comment}</p>}
                  </article>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </article>
  )
}

export default ShopDetail
