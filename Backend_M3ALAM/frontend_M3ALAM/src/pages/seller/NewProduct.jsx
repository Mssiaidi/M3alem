import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProduct, getCategories } from '../../api/sellerService'

function NewProduct() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    category_id: '',
    name: '',
    price: '',
    stock: '',
    description: '',
    is_active: true,
    images: '',
  })

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const items = await getCategories()
        if (!active) return
        setCategories(items)
      } catch (err) {
        if (!active) return
        setError(err.message || 'Impossible de charger les catégories.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      await createProduct({
        category_id: Number(form.category_id),
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        is_active: form.is_active,
        images: form.images
          ? form.images
              .split('\n')
              .map((url) => url.trim())
              .filter(Boolean)
          : [],
      })

      navigate('/seller/products')
    } catch (err) {
      setError(err.message || 'Impossible de créer le produit.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="workspace-page">
      <section className="page-hero">
        <div>
          <span className="tag">Nouveau produit</span>
          <h1>Publiez une nouvelle fiche produit en quelques minutes.</h1>
          <p>Structure simple, champs essentiels et rendu adapté à la boutique.</p>
        </div>

        <div className="surface-card">
          <div className="chip-row">
            <span className="tag">Titre clair</span>
            <span className="tag">Photos</span>
            <span className="tag">Prix</span>
            <span className="tag">Stock</span>
          </div>
        </div>
      </section>

      <section className="surface-card">
        <div className="section-head" style={{ marginBottom: '1rem' }}>
          <div>
            <h2>Fiche produit</h2>
            <p>Complétez les informations principales puis enregistrez.</p>
          </div>
        </div>

        {error ? <p className="error-text">{error}</p> : null}
        {loading ? <p className="muted">Chargement des catégories...</p> : null}

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Titre</label>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Ex: Vase Azur artisanal"
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
              placeholder="85"
              type="number"
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-field">
            <label>Stock initial</label>
            <input
              value={form.stock}
              onChange={(event) => setForm({ ...form, stock: event.target.value })}
              placeholder="20"
              type="number"
              min="0"
            />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Décrivez le produit, les matériaux et les points forts."
            />
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Images (1 URL par ligne)</label>
            <textarea
              value={form.images}
              onChange={(event) => setForm({ ...form, images: event.target.value })}
              placeholder="https://..."
            />
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
              {saving ? 'Publication...' : 'Publier le produit'}
            </button>
            <button className="button--ghost button--ghost-dark" type="button">
              Enregistrer brouillon
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default NewProduct
