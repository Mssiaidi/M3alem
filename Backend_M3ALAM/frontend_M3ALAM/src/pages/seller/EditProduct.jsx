import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCategories, getSellerProductById, updateProduct } from '../../api/sellerService'

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

      navigate('/seller/products')
    } catch (err) {
      setError(err.message || 'Impossible de sauvegarder les changements.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="workspace-page">
      <section className="page-hero">
        <div>
          <span className="tag">Modifier produit</span>
          <h1>Affinez la fiche sans casser le flux de vente.</h1>
          <p>Mettez à jour le prix, les stocks, la description ou les visuels.</p>
        </div>

        <div className="surface-card">
          <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="metric">
              <span>Vues</span>
              <strong>1.2K</strong>
            </div>
            <div className="metric">
              <span>Ajouts panier</span>
              <strong>86</strong>
            </div>
            <div className="metric">
              <span>Stock</span>
              <strong>{product?.stock ?? '18'}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-card">
        {error ? <p className="error-text">{error}</p> : null}
        {loading ? <p className="muted">Chargement du produit...</p> : null}

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Titre</label>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </div>
          <div className="form-field">
            <label>Catégorie</label>
            <select
              value={form.category_id}
              onChange={(event) => setForm({ ...form, category_id: event.target.value })}
            >
              <option value="" disabled>
                Choisir une catégorie
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Prix</label>
            <input
              value={form.price}
              onChange={(event) => setForm({ ...form, price: event.target.value })}
              type="number"
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-field">
            <label>Stock</label>
            <input
              value={form.stock}
              onChange={(event) => setForm({ ...form, stock: event.target.value })}
              type="number"
              min="0"
            />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Images du produit</label>
            <input
              accept="image/*"
              multiple
              type="file"
              onChange={(event) => {
                const files = Array.from(event.target.files || [])
                setForm({ ...form, images: files })
                setPreviews(files.map((file) => URL.createObjectURL(file)))
              }}
            />
            {previews.length ? (
              <div className="upload-previews">
                {previews.map((src) => (
                  <img alt="Aperçu produit" key={src} src={src} />
                ))}
              </div>
            ) : null}
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>
              <input
                checked={form.is_active}
                onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
                type="checkbox"
                style={{ width: 'auto', marginRight: '0.5rem' }}
              />
              Produit actif
            </label>
          </div>

          <div className="action-row" style={{ gridColumn: '1 / -1', marginTop: '0.25rem' }}>
            <button className="button" type="submit" disabled={saving}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder les changements'}
            </button>
            <button className="button--ghost button--ghost-dark" type="button">
              Archiver
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default EditProduct
