import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  addCartItem,
  checkout,
  getCart,
  getCategories,
  getOrder,
  getOrders,
  getProduct,
  getProducts,
  getShop,
  login,
  register,
  removeCartItem,
  updateCartItem,
} from '../lib/api'

const money = (value) => `${Number(value ?? 0).toLocaleString('fr-MA')} DH`
const imageOf = (product) => product?.images?.[0]?.path ?? 'https://picsum.photos/seed/m3alem/800/800'

function tokenExists() {
  return Boolean(localStorage.getItem('m3alem_token'))
}

export function CataloguePage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  useEffect(() => {
    getProducts().then(setProducts).catch(() => setProducts([]))
    getCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = category === 'all' || product.category?.slug === category
    return matchesQuery && matchesCategory
  }), [products, query, category])

  return (
    <section className="commerce-layout">
      <aside className="filters">
        <p className="eyebrow">Filtres</p>
        <h2>Catalogue</h2>
        <input className="field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un produit" />
        <select className="field" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">Toutes les categories</option>
          {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
        </select>
      </aside>

      <div className="commerce-main">
        <div className="section__head">
          <div>
            <h2>Produits d'Exception</h2>
            <p>{visibleProducts.length} produits disponibles</p>
          </div>
        </div>
        <div className="catalog-grid">
          {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  )
}

function ProductCard({ product }) {
  const navigate = useNavigate()

  const addToCart = async () => {
    if (!tokenExists()) {
      navigate('/login')
      return
    }
    await addCartItem(product.id, 1)
    navigate('/cart')
  }

  return (
    <article className="product">
      <Link to={`/products/${product.slug}`} className="product__media">
        <img src={imageOf(product)} alt={product.name} />
      </Link>
      <div className="product__body">
        <p className="eyebrow">{product.category?.name ?? 'Artisanat'}</p>
        <h4>{product.name}</h4>
        <p className="muted">{product.shop?.name}</p>
        <div className="product__meta">
          <span className="product__price">{money(product.price)}</span>
          <button className="icon-button" type="button" onClick={addToCart} aria-label="Ajouter au panier">cart</button>
        </div>
      </div>
    </article>
  )
}

export function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    getProduct(slug).then(setProduct).catch(() => setProduct(null))
  }, [slug])

  if (!product) return <section className="panel"><h2>Produit introuvable</h2></section>

  const addToCart = async () => {
    if (!tokenExists()) {
      navigate('/login')
      return
    }
    await addCartItem(product.id, 1)
    navigate('/cart')
  }

  return (
    <section className="detail-grid">
      <div className="detail-gallery">
        <img src={imageOf(product)} alt={product.name} />
      </div>
      <div className="detail-info">
        <p className="eyebrow">{product.category?.name}</p>
        <h1>{product.name}</h1>
        <Link className="muted" to={`/shops/${product.shop?.slug}`}>par {product.shop?.name}</Link>
        <strong className="detail-price">{money(product.price)}</strong>
        <p>{product.description}</p>
        <p className="stock-note">Stock disponible : {product.stock}</p>
        <button className="button" type="button" onClick={addToCart}>Ajouter au panier</button>
      </div>
    </section>
  )
}

export function ShopDetailPage() {
  const { slug } = useParams()
  const [shop, setShop] = useState(null)

  useEffect(() => {
    getShop(slug).then(setShop).catch(() => setShop(null))
  }, [slug])

  if (!shop) return <section className="panel"><h2>Boutique introuvable</h2></section>

  return (
    <section className="static-page">
      <div className="shop-hero">
        <p className="eyebrow">Boutique artisan</p>
        <h1>{shop.name}</h1>
        <p>{shop.description}</p>
        <span className="chip">{shop.city}</span>
      </div>
      <div className="catalog-grid">
        {shop.products.map((product) => <ProductCard key={product.id} product={{ ...product, shop }} />)}
      </div>
    </section>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: 'client@m3alem.test', password: 'password' })
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    try {
      const data = await login(form)
      localStorage.setItem('m3alem_token', data.token)
      localStorage.setItem('m3alem_user', JSON.stringify(data.user))
      navigate('/catalogue')
    } catch {
      setError('Email ou mot de passe incorrect.')
    }
  }

  return <AuthForm title="Connexion" form={form} setForm={setForm} error={error} submit={submit} button="Se connecter" />
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'client' })
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    try {
      const data = await register(form)
      localStorage.setItem('m3alem_token', data.token)
      localStorage.setItem('m3alem_user', JSON.stringify(data.user))
      navigate('/catalogue')
    } catch {
      setError('Verifiez les informations saisies.')
    }
  }

  return <AuthForm title="Inscription" form={form} setForm={setForm} error={error} submit={submit} button="Creer mon compte" registerMode />
}

function AuthForm({ title, form, setForm, error, submit, button, registerMode = false }) {
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  return (
    <section className="auth-panel">
      <form className="form-card" onSubmit={submit}>
        <p className="eyebrow">M3alem Marketplace</p>
        <h1>{title}</h1>
        {registerMode ? <input className="field" placeholder="Nom complet" value={form.name} onChange={(e) => update('name', e.target.value)} /> : null}
        <input className="field" type="email" placeholder="Email" value={form.email} onChange={(e) => update('email', e.target.value)} />
        <input className="field" type="password" placeholder="Mot de passe" value={form.password} onChange={(e) => update('password', e.target.value)} />
        {registerMode ? (
          <>
            <input className="field" type="password" placeholder="Confirmer le mot de passe" value={form.password_confirmation} onChange={(e) => update('password_confirmation', e.target.value)} />
            <select className="field" value={form.role} onChange={(e) => update('role', e.target.value)}>
              <option value="client">Client</option>
              <option value="seller">Vendeur</option>
            </select>
          </>
        ) : null}
        {error ? <p className="error-text">{error}</p> : null}
        <button className="button" type="submit">{button}</button>
      </form>
    </section>
  )
}

export function CartPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState({ items: [], total: 0 })

  const refresh = () => getCart().then(setCart).catch(() => navigate('/login'))

  useEffect(() => {
    refresh()
  }, [])

  return (
    <section className="checkout-grid">
      <div className="cart-list">
        <h1>Votre Panier</h1>
        {cart.items.map((item) => (
          <article className="cart-item" key={item.id}>
            <img src={imageOf(item.product)} alt={item.product.name} />
            <div>
              <h3>{item.product.name}</h3>
              <p>{item.product.shop?.name}</p>
              <strong>{money(item.unit_price)}</strong>
            </div>
            <div className="qty">
              <button onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1)).then(setCart)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateCartItem(item.id, item.quantity + 1).then(setCart)}>+</button>
            </div>
            <button className="link-danger" onClick={() => removeCartItem(item.id).then(setCart)}>Supprimer</button>
          </article>
        ))}
      </div>
      <aside className="summary-card">
        <h2>Resume</h2>
        <div className="summary-line"><span>Total</span><strong>{money(cart.total)}</strong></div>
        <Link className="button" to="/checkout">Finaliser la commande</Link>
      </aside>
    </section>
  )
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', shipping_city: '', shipping_address: '', notes: '' })

  const submit = async (event) => {
    event.preventDefault()
    const order = await checkout(form)
    navigate(`/orders/${order.id}`)
  }

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  return (
    <section className="auth-panel">
      <form className="form-card" onSubmit={submit}>
        <p className="eyebrow">Checkout</p>
        <h1>Finalisation commande</h1>
        <input className="field" placeholder="Nom complet" value={form.customer_name} onChange={(e) => update('customer_name', e.target.value)} />
        <input className="field" placeholder="Telephone" value={form.customer_phone} onChange={(e) => update('customer_phone', e.target.value)} />
        <input className="field" placeholder="Ville" value={form.shipping_city} onChange={(e) => update('shipping_city', e.target.value)} />
        <input className="field" placeholder="Adresse de livraison" value={form.shipping_address} onChange={(e) => update('shipping_address', e.target.value)} />
        <textarea className="field" placeholder="Notes optionnelles" value={form.notes} onChange={(e) => update('notes', e.target.value)} />
        <button className="button" type="submit">Confirmer la commande</button>
      </form>
    </section>
  )
}

export function OrdersPage() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    getOrders().then(setOrders).catch(() => setOrders([]))
  }, [])

  return (
    <section className="panel">
      <div className="section__head"><h2>Mes commandes</h2></div>
      <div className="orders-table">
        {orders.map((order) => (
          <Link className="order-row" to={`/orders/${order.id}`} key={order.id}>
            <strong>{order.reference}</strong>
            <span>{order.status}</span>
            <span>{money(order.total_amount)}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    getOrder(id).then(setOrder).catch(() => setOrder(null))
  }, [id])

  if (!order) return <section className="panel"><h2>Commande introuvable</h2></section>

  return (
    <section className="panel">
      <p className="eyebrow">{order.status}</p>
      <h1>{order.reference}</h1>
      <p>{order.shipping_address}, {order.shipping_city}</p>
      <div className="cart-list">
        {order.items.map((item) => (
          <article className="cart-item" key={item.id}>
            <img src={imageOf(item.product)} alt={item.product_name} />
            <div>
              <h3>{item.product_name}</h3>
              <p>Quantite : {item.quantity}</p>
            </div>
            <strong>{money(item.total_price)}</strong>
          </article>
        ))}
      </div>
      <div className="summary-line"><span>Total</span><strong>{money(order.total_amount)}</strong></div>
    </section>
  )
}
