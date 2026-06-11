import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCart, notifyCartUpdated } from '../../api/cartService'
import { checkout } from '../../api/orderService'

const fallbackProductImage = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80'

function formatPrice(price) {
  return `${Number(price || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} DH`
}

function itemImage(item) {
  return item.product?.images?.[0]?.path || fallbackProductImage
}

function lineTotal(item) {
  return Number(item.unit_price || 0) * Number(item.quantity || 0)
}

function Checkout() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    shipping_city: '',
    shipping_address: '',
    notes: '',
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const items = useMemo(() => cart?.items || [], [cart])
  const itemCount = items.reduce((total, item) => total + Number(item.quantity || 0), 0)

  useEffect(() => {
    let active = true

    setLoading(true)
    setError('')

    getCart()
      .then((cartData) => {
        if (!active) return
        setCart(cartData)
      })
      .catch((cartError) => {
        if (!active) return
        setError(cartError.message || 'Impossible de charger votre panier.')
        setCart({ items: [], subtotal: 0, total: 0 })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const validateForm = () => {
    if (!form.customer_name.trim()) return 'Le nom complet est obligatoire.'
    if (!form.customer_phone.trim()) return 'Le telephone est obligatoire.'
    if (!form.shipping_city.trim()) return 'La ville est obligatoire.'
    if (!form.shipping_address.trim()) return 'L adresse de livraison est obligatoire.'
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationMessage = validateForm()
    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const order = await checkout({
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        shipping_city: form.shipping_city.trim(),
        shipping_address: form.shipping_address.trim(),
        notes: form.notes.trim() || null,
      })

      notifyCartUpdated(0, { silent: true })
      navigate(`/orders/${order.id}`, { replace: true })
    } catch (checkoutError) {
      setError(checkoutError.message || 'Impossible de confirmer la commande.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="muted">Chargement du checkout...</p>
  }

  if (items.length === 0) {
    return (
      <section className="checkout-empty">
        <h1>Votre panier est vide.</h1>
        <p>Ajoutez des produits artisanaux avant de finaliser une commande.</p>
        <Link className="button" to="/catalogue">Retour au catalogue</Link>
      </section>
    )
  }

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <div>
          <p>Finalisation</p>
          <h1>Confirmer la commande</h1>
        </div>
        <Link to="/cart">Modifier le panier</Link>
      </header>

      {error && <p className="checkout-error">{error}</p>}

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <section className="checkout-panel">
            <div className="checkout-panel__head">
              <span>1</span>
              <div>
                <h2>Informations de livraison</h2>
                <p>Ces informations seront enregistrees dans la commande.</p>
              </div>
            </div>

            <div className="checkout-form__grid">
              <label>
                <span>Nom complet</span>
                <input
                  autoComplete="name"
                  onChange={(event) => updateField('customer_name', event.target.value)}
                  placeholder="Client M3alem"
                  required
                  type="text"
                  value={form.customer_name}
                />
              </label>

              <label>
                <span>Telephone</span>
                <input
                  autoComplete="tel"
                  onChange={(event) => updateField('customer_phone', event.target.value)}
                  placeholder="0600000000"
                  required
                  type="tel"
                  value={form.customer_phone}
                />
              </label>
            </div>

            <label>
              <span>Ville</span>
              <input
                autoComplete="address-level2"
                onChange={(event) => updateField('shipping_city', event.target.value)}
                placeholder="Casablanca"
                required
                type="text"
                value={form.shipping_city}
              />
            </label>

            <label>
              <span>Adresse complete</span>
              <textarea
                autoComplete="street-address"
                onChange={(event) => updateField('shipping_address', event.target.value)}
                placeholder="Rue, quartier, numero de maison..."
                required
                rows="3"
                value={form.shipping_address}
              />
            </label>

            <label>
              <span>Notes pour les artisans</span>
              <textarea
                onChange={(event) => updateField('notes', event.target.value)}
                placeholder="Instructions de livraison, disponibilite, details utiles..."
                rows="3"
                value={form.notes}
              />
            </label>
          </section>

          <section className="checkout-panel">
            <div className="checkout-panel__head">
              <span>2</span>
              <div>
                <h2>Validation</h2>
                <p>La commande sera creee avec le stock et les prix actuels du backend.</p>
              </div>
            </div>

            <div className="checkout-assurance">
              <span>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 3 5.5 5.4v5.4c0 4 2.6 7.6 6.5 9.2 3.9-1.6 6.5-5.2 6.5-9.2V5.4L12 3Z" />
                  <path d="m8.8 11.8 2.1 2.1 4.4-4.7" />
                </svg>
                Stock reverifie avant confirmation
              </span>
              <span>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M3 6h11v10H3z" />
                  <path d="M14 10h3.4L21 13.7V16h-7z" />
                  <circle cx="7" cy="18" r="2" />
                  <circle cx="17" cy="18" r="2" />
                </svg>
                Livraison suivie par les artisans
              </span>
            </div>
          </section>

          <button className="checkout-submit" disabled={submitting} type="submit">
            {submitting ? 'Creation de la commande...' : 'Confirmer la commande'}
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Resume</h2>
          <p>{itemCount} article{itemCount > 1 ? 's' : ''} dans votre commande.</p>

          <div className="checkout-summary__items">
            {items.map((item) => (
              <article className="checkout-summary-item" key={item.id}>
                <img src={itemImage(item)} alt={item.product?.images?.[0]?.alt_text || item.product?.name} />
                <div>
                  <strong>{item.product?.name || 'Produit'}</strong>
                  <span>{item.product?.shop?.name || 'Boutique artisan'}</span>
                  <small>Quantite: {item.quantity}</small>
                </div>
                <b>{formatPrice(lineTotal(item))}</b>
              </article>
            ))}
          </div>

          <div className="checkout-summary__rows">
            <div>
              <span>Sous-total</span>
              <strong>{formatPrice(cart?.subtotal)}</strong>
            </div>
            <div>
              <span>Livraison</span>
              <strong>Gratuit</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{formatPrice(cart?.total)}</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Checkout
