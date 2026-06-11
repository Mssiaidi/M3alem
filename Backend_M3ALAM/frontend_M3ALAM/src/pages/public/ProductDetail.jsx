import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { addCartItem, notifyCartUpdated } from '../../api/cartService'
import { getProduct } from '../../api/catalogService'

function formatPrice(price) {
  return `${Number(price || 0).toLocaleString('fr-FR')} DH`
}

function formatRating(product) {
  if (!product?.rating_avg) return null
  return Number(product.rating_avg).toFixed(1)
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

function ProductDetail() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cartMessage, setCartMessage] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setCartMessage('')

    getProduct(slug)
      .then((data) => {
        if (!active) return
        setProduct(data)
        setSelectedImage(data.images?.[0] || null)
      })
      .catch(() => {
        if (active) setError('Produit introuvable ou indisponible.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [slug])

  const rating = formatRating(product)
  const reviews = useMemo(() => product?.reviews || [], [product])
  const relatedProducts = product?.related_products || []
  const galleryThumbs = useMemo(
    () => product?.images?.filter((image) => image.id !== selectedImage?.id) || [],
    [product, selectedImage],
  )

  const handleAddToCart = async () => {
    if (!product) return

    setAdding(true)
    setCartMessage('')

    try {
      await addCartItem(product.id, 1)
      notifyCartUpdated(1)
    } catch (addError) {
      setCartMessage(addError.message || 'Connectez-vous comme client pour ajouter au panier.')
    } finally {
      setAdding(false)
    }
  }

  if (loading) return <p className="muted">Chargement du produit...</p>
  if (error) return <p className="panel panel--error">{error}</p>
  if (!product) return null

  return (
    <article className="product-detail-page">
      <nav className="product-breadcrumb" aria-label="Fil d'Ariane">
        <Link to="/">Accueil</Link>
        <span>&gt;</span>
        <Link to="/catalogue">Catalogue</Link>
        {product.category && (
          <>
            <span>&gt;</span>
            <Link to={`/catalogue?category=${product.category.slug}`}>{product.category.name}</Link>
          </>
        )}
        <span>&gt;</span>
        <strong>{product.name}</strong>
      </nav>

      <section className="product-detail-main">
        <div className="product-gallery">
          {selectedImage ? (
            <div className="product-gallery__main">
              <img src={selectedImage.path} alt={selectedImage.alt_text || product.name} />
            </div>
          ) : (
            <div className="product-gallery__missing">Images indisponibles pour ce produit.</div>
          )}

          {galleryThumbs.length > 0 && (
            <div className="product-gallery__thumbs">
              {galleryThumbs.map((image) => (
                <button key={image.id} onClick={() => setSelectedImage(image)} type="button">
                  <img src={image.path} alt={image.alt_text || product.name} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <div className="product-detail-info__head">
            {product.category && <span className="pill pill--accent">{product.category.name}</span>}
            {rating && (
              <div className="product-detail-rating">
                <span aria-hidden="true">★</span>
                <strong>{rating}</strong>
                <span>{product.reviews_count} avis</span>
              </div>
            )}
          </div>

          <h1>{product.name}</h1>

          {product.shop && (
            <p className="product-detail-shop">
              par <Link to={`/shops/${product.shop.slug}`}>{product.shop.name}</Link>
              {product.shop.city && <span> · {product.shop.city}</span>}
            </p>
          )}

          <strong className="product-detail-price">{formatPrice(product.price)}</strong>

          {product.stock === 0 && (
            <p className="product-detail-stock product-detail-stock--empty">
              Rupture de stock.
            </p>
          )}

          {product.stock > 0 && product.stock <= 3 && (
            <p className="product-detail-stock">
              Stock limite: seulement {product.stock} piece(s) disponible(s).
            </p>
          )}

          <button
            className="product-detail-cart"
            disabled={adding || product.stock === 0}
            onClick={handleAddToCart}
            type="button"
          >
            {adding ? 'Ajout...' : 'Ajouter au panier'}
          </button>
          {cartMessage && <p className="catalogue-message">{cartMessage}</p>}
        </div>
      </section>

      <section className="product-detail-sections">
        {product.description && (
          <div className="product-detail-panel product-detail-description-panel">
            <h2>Description du produit</h2>
            <p>{product.description}</p>
          </div>
        )}

        {product.shop && (
          <aside className="product-detail-panel product-detail-artisan">
            <h2>Details artisan</h2>
            <div className="product-detail-artisan__identity">
              <div>{initials(product.shop.user?.name || product.shop.name)}</div>
              <div>
                <strong>{product.shop.user?.name || product.shop.name}</strong>
                {product.shop.city && <span>{product.shop.city}</span>}
              </div>
            </div>
            {product.shop.description && <p>{product.shop.description}</p>}
            <Link to={`/shops/${product.shop.slug}`}>Voir la boutique</Link>
          </aside>
        )}
      </section>

      <section className="product-detail-reviews">
        <div className="section__head">
          <h2>Avis clients</h2>
          {product.reviews_count > 0 && <p>{product.reviews_count} avis verifies</p>}
        </div>

        {reviews.length > 0 ? (
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
        ) : (
          <p className="muted">Aucun avis disponible pour ce produit.</p>
        )}
      </section>

      {relatedProducts.length > 0 && (
        <section className="product-detail-related">
          <div className="section__head">
            <h2>Produits similaires</h2>
            {product.category && (
              <Link className="section__action" to={`/catalogue?category=${product.category.slug}`}>
                Voir la categorie
              </Link>
            )}
          </div>
          <div className="products">
            {relatedProducts.map((relatedProduct) => (
              <Link className="product product-link" key={relatedProduct.id} to={`/products/${relatedProduct.slug}`}>
                <div className="product__media">
                  {relatedProduct.images?.[0] && (
                    <img
                      src={relatedProduct.images[0].path}
                      alt={relatedProduct.images[0].alt_text || relatedProduct.name}
                    />
                  )}
                </div>
                <div className="product__body">
                  <p>{relatedProduct.category?.name}</p>
                  <h4>{relatedProduct.name}</h4>
                  <div className="product__meta">
                    <span className="product__price">{formatPrice(relatedProduct.price)}</span>
                    {formatRating(relatedProduct) && (
                      <span className="product__rating">★ {formatRating(relatedProduct)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

export default ProductDetail
