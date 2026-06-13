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

  useEffect(() => {
    return () => {
      previews.forEach((src) => URL.revokeObjectURL(src))
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
    <div className="new-product-page">
      <section className="new-product-hero">
        <div className="new-product-hero__copy">
          <span className="new-product-eyebrow">My Products</span>
          <div className="new-product-breadcrumbs">
            <span>Produits vendeur</span>
            <span>›</span>
            <strong>Nouveau produit</strong>
          </div>
          <h1>Création d&apos;artisanat</h1>
          <p>
            Décrivez votre nouvelle pièce, ajoutez ses images, choisissez sa catégorie et publiez
            une fiche propre directement dans votre base de données.
          </p>

          <div className="new-product-hero__stats">
            <div>
              <span>Complétion</span>
              <strong>{completion}%</strong>
            </div>
            <div>
              <span>Images</span>
              <strong>{previews.length}</strong>
            </div>
            <div>
              <span>Catégorie</span>
              <strong>{selectedCategory ? selectedCategory.name : 'Aucune'}</strong>
            </div>
          </div>
        </div>

        <div className="new-product-hero__visual">
          <div className="new-product-hero__card">
            <span className="material-symbols-outlined">sparkles</span>
            <strong>Studio prêt à publier</strong>
            <p>Un parcours simple pour créer un produit avec image, prix, stock et visibilité.</p>
          </div>
        </div>
      </section>

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p className="muted">Chargement des catégories...</p> : null}

      <form className="new-product-layout" onSubmit={handleSubmit}>
        <section className="new-product-main">
          <article className="new-product-panel new-product-panel--glass">
            <div className="new-product-panel__head">
              <div>
                <h2>Informations générales</h2>
                <p>Les champs principaux du produit, synchronisés avec le backend.</p>
              </div>
              <span className="tag tag--warn">Brouillon</span>
            </div>

            <div className="new-product-form">
              <label className="new-field">
                <span>Nom de la création</span>
                <input
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Ex: Vase en céramique émaillée"
                  type="text"
                  value={form.name}
                  required
                />
              </label>

              <label className="new-field">
                <span>Description de l’artisanat</span>
                <textarea
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Racontez l'histoire de cette pièce..."
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
                    placeholder="0.00"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    required
                  />
                </label>
                <label className="new-field">
                  <span>Stock disponible</span>
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
                <span className="material-symbols-outlined new-product-upload__icon">add_a_photo</span>
                <strong>Ajouter les photos</strong>
                <small>Glissez ou cliquez pour ajouter les images du produit</small>
              </label>

              <div className="new-product-gallery">
                <div className="new-product-gallery__head">
                  <h3>Galerie images</h3>
                  <span>{previews.length}/4</span>
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
            <p>Basé sur la complétion de votre profil et la description du produit.</p>
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
              <button className="button--ghost button--ghost-dark" type="button" onClick={() => navigate('/seller/products')}>
                <span className="material-symbols-outlined">close</span>
                Annuler
              </button>
              <button className="button--ghost button--ghost-dark" type="button" onClick={() => setForm({ ...form, is_active: false })}>
                <span className="material-symbols-outlined">draft</span>
                Brouillon
              </button>
              <button className="button" disabled={saving} type="submit">
                <span className="material-symbols-outlined">publish</span>
                {saving ? 'Publication...' : 'Publier le produit'}
              </button>
            </div>
          </article>
        </aside>
      </form>
    </div>
  )
}

export default NewProduct
