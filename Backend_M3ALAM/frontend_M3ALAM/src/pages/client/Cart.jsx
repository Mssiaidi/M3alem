import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCart, notifyCartUpdated, removeCartItem, updateCartItem } from '../../api/cartService'
import { getProductsPage } from '../../api/catalogService'

const fallbackProductImage = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80'

function formatPrice(price) {
  return `${Number(price || 0).toLocaleString('fr-FR')} DH`
}

function itemImage(item) {
  return item.product?.images?.[0]?.path || fallbackProductImage
}

function itemTotal(item) {
  return Number(item.unit_price || 0) * Number(item.quantity || 0)
}

function Cart() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [actionId, setActionId] = useState(null)

  const items = useMemo(() => cart?.items || [], [cart])
  const itemCount = items.reduce((total, item) => total + Number(item.quantity || 0), 0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setMessage('')

    Promise.all([
      getCart(),
      getProductsPage({ per_page: 4, sort: 'rating_desc' }),
    ])
      .then(([cartData, productsPage]) => {
        if (!active) return
        setCart(cartData)
        setRecommendations(productsPage.data || [])
      })
      .catch((error) => {
        if (!active) return
        setMessage(error.message || 'Impossible de charger le panier.')
        setCart({ items: [], subtotal: 0, total: 0 })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const refreshCart = (nextCart) => {
    setCart(nextCart)
  }

  const changeQuantity = async (item, nextQuantity) => {
    if (nextQuantity < 1) return

    setActionId(item.id)
    setMessage('')

    try {
      const nextCart = await updateCartItem(item.id, nextQuantity)
      refreshCart(nextCart)
      notifyCartUpdated(0, { silent: true })

      if (nextQuantity > item.product?.stock) {
        setMessage('La quantite a ete ajustee selon le stock disponible.')
      }
    } catch (error) {
      setMessage(error.message || 'Impossible de modifier la quantite.')
    } finally {
      setActionId(null)
    }
  }

  const removeItem = async (item) => {
    setActionId(item.id)
    setMessage('')

    try {
      const nextCart = await removeCartItem(item.id)
      refreshCart(nextCart)
      notifyCartUpdated(0, { silent: true })
      setMessage('Article supprime du panier.')
    } catch (error) {
      setMessage(error.message || 'Impossible de supprimer cet article.')
    } finally {
      setActionId(null)
    }
  }

  if (loading) {
    return <p className="muted">Chargement du panier...</p>
  }

  return (
    <div className="cart-page">
      <header className="cart-header">
        <div>
          <p>Panier client</p>
          <h1>Votre panier</h1>
        </div>
        <span>{itemCount} article{itemCount > 1 ? 's' : ''}</span>
      </header>

      {message && <p className="cart-message">{message}</p>}

      {items.length === 0 ? (
        <section className="cart-empty">
          <h2>Votre panier est vide.</h2>
          <p>Explorez le catalogue et ajoutez des pieces artisanales avant de finaliser une commande.</p>
          <Link className="button" to="/catalogue">Voir le catalogue</Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items" aria-label="Articles du panier">
            {items.map((item) => (
              <article className="cart-item" key={item.id}>
                <Link className="cart-item__media" to={`/products/${item.product?.slug || ''}`}>
                  <img src={itemImage(item)} alt={item.product?.images?.[0]?.alt_text || item.product?.name} />
                </Link>

                <div className="cart-item__body">
                  <div className="cart-item__top">
                    <div>
                      {item.product?.category && <span className="cart-item__category">{item.product.category.name}</span>}
                      <Link className="cart-item__title" to={`/products/${item.product?.slug || ''}`}>
                        {item.product?.name || item.product_name || 'Produit'}
                      </Link>
                      {item.product?.shop && (
                        <Link className="cart-item__shop" to={`/shops/${item.product.shop.slug}`}>
                          Artisan: {item.product.shop.name}
                        </Link>
                      )}
                    </div>
                    {item.product?.stock > 0 && item.product.stock <= 3 && (
                      <span className="cart-item__stock">Stock limite</span>
                    )}
                  </div>

                  <div className="cart-item__price">
                    <strong>{formatPrice(item.unit_price)}</strong>
                    <span>Total ligne: {formatPrice(itemTotal(item))}</span>
                  </div>

                  <div className="cart-item__actions">
                    <div className="cart-quantity">
                      <button
                        aria-label="Diminuer la quantite"
                        disabled={actionId === item.id || item.quantity <= 1}
                        onClick={() => changeQuantity(item, item.quantity - 1)}
                        type="button"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        aria-label="Augmenter la quantite"
                        disabled={actionId === item.id || item.quantity >= item.product?.stock}
                        onClick={() => changeQuantity(item, item.quantity + 1)}
                        type="button"
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="cart-remove"
                      disabled={actionId === item.id}
                      onClick={() => removeItem(item)}
                      type="button"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="cart-summary">
            <h2>Résumé de la commande</h2>
            <div className="cart-summary__rows">
              <div>
                <span>Sous-total</span>
                <strong>{formatPrice(cart?.subtotal)}</strong>
              </div>
              <div>
                <span>Frais de livraison</span>
                <strong>Gratuit</strong>
              </div>
              <div>
                <span>Remises</span>
                <strong>{formatPrice(0)}</strong>
              </div>
            </div>

            <div className="cart-promo">
              <label htmlFor="promo-code">Code promo</label>
              <div>
                <input disabled id="promo-code" placeholder="Bientot disponible" type="text" />
                <button disabled type="button">Appliquer</button>
              </div>
              <p>Les codes promo seront connectés au backend dans une prochaine étape.</p>
            </div>

            <div className="cart-summary__total">
              <span>Total</span>
              <strong>{formatPrice(cart?.total)}</strong>
              <small>TVA incluse</small>
            </div>

            <button className="cart-checkout" onClick={() => navigate('/checkout')} type="button">
              Finaliser la commande
            </button>

            <div className="cart-trust">
              <span>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 3 5.5 5.4v5.4c0 4 2.6 7.6 6.5 9.2 3.9-1.6 6.5-5.2 6.5-9.2V5.4L12 3Z" />
                  <path d="m8.8 11.8 2.1 2.1 4.4-4.7" />
                </svg>
                Compte client vérifié
              </span>
              <span>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M3 6h11v10H3z" />
                  <path d="M14 10h3.4L21 13.7V16h-7z" />
                  <circle cx="7" cy="18" r="2" />
                  <circle cx="17" cy="18" r="2" />
                </svg>
                Livraison suivie par nos artisans
              </span>
            </div>
          </aside>
        </div>
      )}

      {recommendations.length > 0 && (
        <section className="cart-recommendations">
          <div className="section__head">
            <h2>Vous pourriez aussi aimer</h2>
            <Link className="section__action" to="/catalogue">Voir plus</Link>
          </div>
          <div className="cart-recommendations__grid">
            {recommendations.map((product) => (
              <Link className="cart-recommendation" key={product.id} to={`/products/${product.slug}`}>
                <img src={product.images?.[0]?.path || fallbackProductImage} alt={product.images?.[0]?.alt_text || product.name} />
                <div>
                  <span>{product.category?.name || 'Artisanat'}</span>
                  <strong>{product.name}</strong>
                  <small>{formatPrice(product.price)}</small>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default Cart
