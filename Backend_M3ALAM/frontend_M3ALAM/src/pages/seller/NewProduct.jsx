import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProduct, getCategories } from '../../api/sellerService'

function NewProduct() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [previews, setPreviews] = useState([])
  const [form, setForm] = useState({
    category_id: '',
    name: '',
    price: '',
    stock: 1,
    description: '',
    is_active: true,
    images: [],
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

  const selectedCategory = useMemo(
    () => categories.find((category) => String(category.id) === String(form.category_id)),
    [categories, form.category_id],
  )

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

      await createProduct(payload)
      navigate('/seller/products')
    } catch (err) {
      setError(err.message || 'Impossible de créer le produit.')
    } finally {
      setSaving(false)
    }
  }

  const qualityStars = [1, 2, 3, 4, 5]

  return (
    <div className="new-product-shell">
      <div className="new-product-breadcrumbs">
        <span>My Products</span>
        <span>›</span>
        <strong>Nouveau Produit</strong>
      </div>

      <header className="new-product-head">
        <h1>Création d&apos;Artisanat</h1>
        <p>Déballez votre nouvelle création pour la mettre en valeur sur le Marketplace.</p>
      </header>

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p className="muted">Chargement des catégories...</p> : null}

      <div className="new-product-layout">
        <section className="new-product-main">
          <article className="new-product-panel">
            <div className="new-product-panel__head">
              <h2>Informations Générales</h2>
              <span className="tag tag--warn">Brouillon</span>
            </div>

            <form onSubmit={handleSubmit} className="new-product-form">
              <div className="form-field">
                <label>Nom de la Création</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Ex: Vase en Céramique Émaillée"
                />
              </div>

              <div className="form-field">
                <label>Description de l&apos;Artisanat</label>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Racontez l'histoire de cette pièce..."
                />
              </div>

              <div className="new-product-row">
                <div className="form-field">
                  <label>Prix (MAD)</label>
                  <input
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: event.target.value })}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="form-field">
                  <label>Stock Disponible</label>
                  <input
                    value={form.stock}
                    onChange={(event) => setForm({ ...form, stock: event.target.value })}
                    type="number"
                    min="0"
                  />
                </div>
              </div>

              <div className="new-product-upload">
                <label className="new-product-upload__drop">
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
                  <span className="new-product-upload__icon">📷</span>
                  <strong>Ajouter la photo principale</strong>
                  <small>Glissez ou cliquez pour ajouter des images</small>
                </label>

                <div className="new-product-gallery">
                  <h3>Galerie Images</h3>
                  <div className="new-product-gallery__grid">
                    {previews.slice(0, 2).map((src) => (
                      <img alt="Aperçu produit" key={src} src={src} />
                    ))}
                    {Array.from({ length: Math.max(0, 4 - previews.slice(0, 2).length) }).map((_, index) => (
                      <div className="new-product-gallery__empty" key={index}>
                        ⌂
                      </div>
                    ))}
                  </div>
                </div>
              </div>

        <div className="new-product-actions">
          <button className="button--ghost button--ghost-dark" type="button">
            <span className="material-symbols-outlined">close</span>
            Annuler
          </button>
          <button className="button--ghost button--ghost-dark" type="button">
            <span className="material-symbols-outlined">draft</span>
            Enregistrer comme brouillon
          </button>
          <button className="button" disabled={saving} type="submit">
            <span className="material-symbols-outlined">publish</span>
            {saving ? 'Publication...' : 'Publier le Produit'}
          </button>
        </div>
            </form>
          </article>
        </section>

        <aside className="new-product-side">
          <article className="new-product-panel">
            <h2>Estimation Qualité</h2>
            <div className="new-product-rating">
              {qualityStars.map((star) => (
                <span key={star}>★</span>
              ))}
            </div>
            <div className="new-product-rating__label">Standard Artisan</div>
            <p>Basé sur la complétion de votre profil et la description.</p>
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
        </aside>
      </div>
    </div>
  )
}

export default NewProduct
