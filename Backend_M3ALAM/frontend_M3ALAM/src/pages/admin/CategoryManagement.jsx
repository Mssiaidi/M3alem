import { useEffect, useMemo, useState } from 'react'
import { createCategory, deleteCategory, getAdminCategories, updateCategory } from '../../api/adminService'

function CategoryManagement() {
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({ id: null, name: '', description: '' })

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const payload = await getAdminCategories()
        if (!active) return
        setCategories(Array.isArray(payload) ? payload : payload.data || [])
      } catch (err) {
        if (!active) return
        setError(err.message || 'Impossible de charger les catégories.')
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const total = categories.length || 24
    const activeCount = categories.filter((category) => category.is_active !== false).length || 8
    const pending = Math.max(0, total - activeCount)

    return { total, activeCount, pending }
  }, [categories])

  async function refreshCategories() {
    const payload = await getAdminCategories()
    setCategories(Array.isArray(payload) ? payload : payload.data || [])
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      if (form.id) {
        await updateCategory(form.id, {
          name: form.name,
          description: form.description,
        })
      } else {
        await createCategory({
          name: form.name,
          description: form.description,
        })
      }

      setForm({ id: null, name: '', description: '' })
      await refreshCategories()
    } catch (err) {
      setError(err.message || 'Impossible d’enregistrer la catégorie.')
    }
  }

  async function handleDelete(categoryId) {
    try {
      await deleteCategory(categoryId)
      await refreshCategories()
    } catch (err) {
      setError(err.message || 'Impossible de supprimer la catégorie.')
    }
  }

  return (
    <div className="category-management-shell">
      <header className="category-management-head">
        <div>
          <h1>Gestion des Catégories</h1>
          <p>Organisez votre inventaire d&apos;artisanat professionnel</p>
        </div>
        <button className="button" type="button" onClick={() => setForm({ id: null, name: '', description: '' })}>
          <span className="material-symbols-outlined">add</span>
          Nouvelle Catégorie
        </button>
      </header>

      {error ? <p className="error-text">{error}</p> : null}

      <section className="category-grid">
        {categories.slice(0, 3).map((category, index) => (
          <article className="category-card" key={category.id}>
            <div className="category-card__head">
              <div className="category-icon">
                <span className="material-symbols-outlined">
                  {['kitchen', 'dresser', 'checkroom'][index] || 'category'}
                </span>
              </div>
              <span className="category-count">{category.products_count ?? 0} Produits</span>
            </div>

            <h2>{category.name}</h2>
            <p>{category.description || 'Description de catégorie.'}</p>

            <div className="category-card__footer">
              <span className={`tag ${category.is_active !== false ? 'tag--success' : 'tag--warn'}`}>
                {category.is_active !== false ? 'ACTIF' : 'À REVOIR'}
              </span>
              <div className="category-card__actions">
                <button
                  className="icon-button category-action"
                  type="button"
                  onClick={() =>
                    setForm({
                      id: category.id,
                      name: category.name,
                      description: category.description || '',
                    })
                  }
                >
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button className="icon-button category-action" type="button" onClick={() => handleDelete(category.id)}>
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          </article>
        ))}

        <article className="category-card category-card--add">
          <div className="category-add-circle">
            <span className="material-symbols-outlined">add_circle</span>
          </div>
          <h2>Ajouter une nouvelle section</h2>
          <p>Développez votre boutique avec de nouvelles spécialités</p>
        </article>
      </section>

      <section className="category-bottom-grid">
        <article className="category-performance">
          <div className="category-section-head">
            <span className="material-symbols-outlined">trending_up</span>
            <h3>Performance par Catégorie</h3>
          </div>

          <div className="category-bars">
            {[
              ['Poterie', 42],
              ['Textiles', 35],
              ['Menuiserie', 23],
            ].map(([label, percent]) => (
              <div className="category-bar-row" key={label}>
                <div className="category-bar-row__top">
                  <strong>{label}</strong>
                  <span>{percent}% des ventes</span>
                </div>
                <div className="category-bar-track">
                  <div style={{ width: `${percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="category-promo">
          <span className="category-promo__pill">Promo du Mois</span>
          <div className="category-promo__content">
            <div>
              <h3>Mise en avant Automnale</h3>
              <p>
                Boostez la visibilité de votre catégorie "Textiles" avec nos outils marketing intégrés.
              </p>
              <a href="/admin/categories">En savoir plus →</a>
            </div>
            <div className="category-promo__image" />
          </div>
        </article>
      </section>

      <section className="category-form-panel">
        <h3>{form.id ? 'Modifier la catégorie' : 'Créer une catégorie'}</h3>
        <form className="category-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Nom</label>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Ex: Poterie & Céramique"
            />
          </div>
          <div className="form-field">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Décrivez la catégorie..."
            />
          </div>
          <div className="category-form__actions">
            <button className="button" type="submit">
              {form.id ? 'Enregistrer' : 'Créer'}
            </button>
            <button
              className="button--ghost button--ghost-dark"
              type="button"
              onClick={() => setForm({ id: null, name: '', description: '' })}
            >
              Annuler
            </button>
          </div>
        </form>
        <div className="category-form__stats">
          <div>
            <span>Catégories</span>
            <strong>{stats.total}</strong>
          </div>
          <div>
            <span>Principales</span>
            <strong>{stats.activeCount}</strong>
          </div>
          <div>
            <span>En attente</span>
            <strong>{stats.pending}</strong>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CategoryManagement
