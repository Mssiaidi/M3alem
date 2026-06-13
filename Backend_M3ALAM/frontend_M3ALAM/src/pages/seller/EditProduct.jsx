import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCategories, getSellerProductById, updateProduct } from '../../api/sellerService'

function formatMoney(value) {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [product, setProduct] = useState(null)
  const [previews, setPreviews] = useState([])
  const [form, setForm] = useState({
    category_id: '',
    name: '',
    price: '',
    stock: '',
    description: '',
    is_active: true,
    images: [],
  })

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [items, found] = await Promise.all([getCategories(), getSellerProductById(id)])
        if (!active) return
        setCategories(items)
        setProduct(found || null)
        if (found) {
          setForm({
            category_id: String(found.category_id || found.category?.id || ''),
            name: found.name || '',
            price: String(found.price ?? ''),
            stock: String(found.stock ?? ''),
            description: found.description || '',
            is_active: Boolean(found.is_active),
            images: [],
          })
          setPreviews((found.images || []).map((image) => image.path).filter(Boolean))
        }
      } catch (err) {
        if (!active) return
        setError(err.message || 'Impossible de charger le produit.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    return () => {
      previews.forEach((src) => {
        if (src.startsWith('blob:')) URL.revokeObjectURL(src)
      })
    }
  }, [previews])

  const selectedCategory = useMemo(
    () => categories.find((category) => String(category.id) === String(form.category_id)),
    [categories, form.category_id],
  )

  const completion = useMemo(() => {
    const fields = [form.category_id, form.name, form.price, form.description]
    const filled = fields.filter((value) => String(value).trim() !== '').length
    return Math.round((filled / fields.length) * 100)
  }, [form])

  const stockState = useMemo(() => {
    const stock = Number(form.stock || 0)
    if (stock === 0) return 'Rupture'
    if (stock <= 5) return 'Stock faible'
    return 'En stock'
  }, [form.stock])

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = new FormData()
      payload.append('category_id', String(form.category_id))
      payload.append('name', form.name)
      payload.append('description', form.description)
      payload.append('price', String(form.price))
      payload.append('stock', String(form.stock))
      payload.append('is_active', form.is_active ? '1' : '0')
      form.images.forEach((file) => payload.append('images[]', file))
      payload.append('_method', 'PUT')

      await updateProduct(id, payload)
      navigate('/seller/products', {
        replace: true,
        state: {
          toast: 'Produit sauvegardé avec succès.',
          refreshKey: Date.now(),
        },
      })
    } catch (err) {
      setError(err.message || 'Impossible de sauvegarder les changements.')
    } finally {
      setSaving(false)
    }
  }

  const qualityStars = [1, 2, 3, 4, 5]

  return (
    <div className="new-product-page">
      <section className="new-product-hero">
        <div className="new-product-hero__copy">
          <span className="new-product-eyebrow">My Products</span>
          <div className="new-product-breadcrumbs">
            <Link to="/seller/products">Produits vendeur</Link>
            <span>›</span>
            <strong>Modifier produit</strong>
          </div>
          <h1>Modification du produit</h1>
          <p>
            Ajuste le prix, les images, la catégorie ou le stock sans perdre le lien avec la base
            de données.
          </p>

          <div className="new-product-hero__stats">
            <div>
              <span>Complétion</span>
              <strong>{completion}%</strong>
            </div>
            <div>
              <span>État stock</span>
              <strong>{stockState}</strong>
            </div>
            <div>
              <span>Prix actuel</span>
              <strong>{formatMoney(form.price || product?.price)}</strong>
            </div>
          </div>
        </div>

        <div className="new-product-hero__visual">
          <div className="new-product-hero__card">
            <span className="material-symbols-outlined">edit</span>
            <strong>Fiche déjà existante</strong>
            <p>Tu peux rafraîchir les infos et remplacer les images si nécessaire.</p>
          </div>
        </div>
      </section>

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p className="muted">Chargement du produit...</p> : null}
      {!loading && !product ? (
        <section className="seller-products-empty">
          <h2>Produit introuvable</h2>
          <p>On n&apos;a pas trouvé ce produit dans la base de données.</p>
          <Link className="button" to="/seller/products">
            Retour à l&apos;inventaire
          </Link>
        </section>
      ) : null}

      {!loading && product ? (
        <form className="new-product-layout" onSubmit={handleSubmit}>
          <section className="new-product-main">
            <article className="new-product-panel new-product-panel--glass">
              <div className="new-product-panel__head">
                <div>
                  <h2>Informations générales</h2>
                  <p>Met à jour les champs de base, puis publie la version modifiée.</p>
                </div>
                <span className="tag tag--warn">ID #{product.id}</span>
              </div>

              <div className="new-product-form">
                <label className="new-field">
                  <span>Nom du produit</span>
                  <input
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Nom du produit"
                    type="text"
                    value={form.name}
                    required
                  />
                </label>

                <label className="new-field">
                  <span>Description</span>
                  <textarea
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    placeholder="Décris le produit..."
                    rows="5"
                    value={form.description}
                    required
                  />
                </label>

                <div className="new-product-row">
                  <label className="new-field">
                    <span>Prix (MAD)</span>
                    <input
                      onChange={(event) => setForm({ ...form, price: event.target.value })}
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      required
                    />
                  </label>
                  <label className="new-field">
                    <span>Stock</span>
                    <input
                      onChange={(event) => setForm({ ...form, stock: event.target.value })}
                      type="number"
                      min="0"
                      value={form.stock}
                      required
                    />
                  </label>
                </div>

                <label className="new-field">
                  <span>Catégorie</span>
                  <select
                    onChange={(event) => setForm({ ...form, category_id: event.target.value })}
                    value={form.category_id}
                    required
                  >
                    <option value="">Choisir une catégorie</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </article>

            <article className="new-product-panel">
              <div className="new-product-upload">
                <label className="new-product-upload__drop">
                  <input
                    accept="image/*"
                    multiple
                    type="file"
                    onChange={(event) => {
                      const files = Array.from(event.target.files || [])
                      const nextPreviews = files.map((file) => URL.createObjectURL(file))
                      setForm({ ...form, images: files })
                      setPreviews(nextPreviews)
                    }}
                  />
                  <span className="material-symbols-outlined new-product-upload__icon">photo_library</span>
                  <strong>Remplacer ou ajouter des images</strong>
                  <small>Choisis de nouvelles photos si tu veux rafraîchir le visuel du produit</small>
                </label>

                <div className="new-product-gallery">
                  <div className="new-product-gallery__head">
                    <h3>Images actuelles</h3>
                    <span>{previews.length} visuel(s)</span>
                  </div>
                  <div className="new-product-gallery__grid">
                    {previews.slice(0, 2).map((src) => (
                      <div className="new-product-gallery__item" key={src}>
                        <img alt="Aperçu produit" src={src} />
                      </div>
                    ))}
                    {Array.from({ length: Math.max(0, 4 - previews.slice(0, 2).length) }).map((_, index) => (
                      <div className="new-product-gallery__empty" key={index}>
                        <span className="material-symbols-outlined">image</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </section>

          <aside className="new-product-side">
            <article className="new-product-panel">
              <h2>Estimation qualité</h2>
              <div className="new-product-rating">
                {qualityStars.map((star) => (
                  <span key={star} className="material-symbols-outlined">
                    star
                  </span>
                ))}
              </div>
              <div className="new-product-rating__label">Standard artisan</div>
              <p>La modification garde l&apos;identité du produit tout en améliorant sa fiche.</p>
            </article>

            <article className="new-product-panel">
              <h2>Catégories</h2>
              <div className="new-product-tags">
                {categories.map((category) => (
                  <button
                    className={String(category.id) === String(form.category_id) ? 'is-active' : ''}
                    key={category.id}
                    type="button"
                    onClick={() => setForm({ ...form, category_id: String(category.id) })}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              {selectedCategory ? <p>{selectedCategory.description}</p> : null}
            </article>

            <article className="new-product-panel new-product-panel--sticky">
              <h2>Actions</h2>
              <div className="new-product-actions">
                <button className="button--ghost button--ghost-dark new-product-actions__cancel" type="button" onClick={() => navigate('/seller/products')}>
                  <span className="material-symbols-outlined">close</span>
                  Annuler
                </button>
                <button
                  className="button--ghost button--ghost-dark new-product-actions__draft"
                  type="button"
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                >
                  <span className="material-symbols-outlined">draft</span>
                  {form.is_active ? 'Mettre en brouillon' : 'Réactiver'}
                </button>
                <button className="button" disabled={saving} type="submit">
                  <span className="material-symbols-outlined">save</span>
                  {saving ? 'Sauvegarde...' : 'Sauvegarder les changements'}
                </button>
              </div>
            </article>
          </aside>
        </form>
      ) : null}
    </div>
  )
}

export default EditProduct
