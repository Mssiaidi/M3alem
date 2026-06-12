import { useEffect, useMemo, useState } from 'react'
import { createCategory, deleteCategory, getAdminCategories, updateCategory } from '../../api/adminService'

function CategoryManagement() {
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [form, setForm] = useState({ id: null, name: '', description: '', is_active: true })

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        const payload = await getAdminCategories()
        if (!active) return
        setCategories(Array.isArray(payload) ? payload : payload.data || [])
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

  const stats = useMemo(() => {
    const total = categories.length
    const activeCount = categories.filter((category) => category.is_active !== false).length
    const inactiveCount = total - activeCount
    const totalProducts = categories.reduce((sum, category) => sum + Number(category.products_count || 0), 0)
    const topCategory = [...categories].sort((a, b) => Number(b.products_count || 0) - Number(a.products_count || 0))[0]

    return {
      total,
      activeCount,
      inactiveCount,
      totalProducts,
      topCategory,
    }
  }, [categories])

  const visibleCategories = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return categories
    return categories.filter((category) => {
      const haystack = `${category.name || ''} ${category.description || ''}`.toLowerCase()
      return haystack.includes(term)
    })
  }, [categories, query])

  const categoryPerformance = useMemo(() => {
    const list = [...categories].sort((a, b) => Number(b.products_count || 0) - Number(a.products_count || 0)).slice(0, 3)
    const max = Math.max(...list.map((category) => Number(category.products_count || 0)), 1)
    return list.map((category) => ({
      ...category,
      percent: Math.max(10, Math.round((Number(category.products_count || 0) / max) * 100)),
    }))
  }, [categories])

  async function refreshCategories() {
    const payload = await getAdminCategories()
    setCategories(Array.isArray(payload) ? payload : payload.data || [])
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      const payload = {
        name: form.name,
        description: form.description,
        is_active: form.is_active,
      }

      if (form.id) {
        await updateCategory(form.id, payload)
      } else {
        await createCategory(payload)
      }

      setForm({ id: null, name: '', description: '', is_active: true })
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
    <div className="category-management-shell admin-shell">
      <header className="category-management-head">
        <div>
          <h1>Gestion des Catégories</h1>
          <p>Organisez votre inventaire d&apos;artisanat professionnel depuis la base de données.</p>
        </div>
        <button className="button" type="button" onClick={() => setForm({ id: null, name: '', description: '', is_active: true })}>
          <span className="material-symbols-outlined">add</span>
          Nouvelle Catégorie
        </button>
      </header>

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p className="admin-state-note">Chargement des catégories depuis la base de données...</p> : null}

      <section className="category-kpi-grid">
        <article className="category-kpi-card">
          <span>Total catégories</span>
          <strong>{stats.total}</strong>
          <small>En base de données</small>
        </article>
        <article className="category-kpi-card">
          <span>Actives</span>
          <strong>{stats.activeCount}</strong>
          <small>Disponibles pour les produits</small>
        </article>
        <article className="category-kpi-card">
          <span>Inactives</span>
          <strong>{stats.inactiveCount}</strong>
          <small>À vérifier ou désactiver</small>
        </article>
        <article className="category-kpi-card category-kpi-card--highlight">
          <span>Total produits</span>
          <strong>{stats.totalProducts}</strong>
          <small>Répartis par catégorie</small>
        </article>
      </section>

      <section className="category-management-layout">
        <article className="category-card-panel">
          <div className="category-panel-head">
            <h2>Catégories chargées</h2>
            <div className="toolbar__search category-search">
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une catégorie..." />
            </div>
          </div>

          <div className="category-grid">
            {visibleCategories.length ? (
              visibleCategories.map((category) => (
                <article className="category-card" key={category.id}>
                  <div className="category-card__head">
                    <div className="category-icon">
                      <span className="material-symbols-outlined">category</span>
                    </div>
                    <span className="category-count">{category.products_count ?? 0} Produits</span>
                  </div>

                  <h3>{category.name}</h3>
                  <p>{category.description || 'Aucune description disponible.'}</p>

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
                            is_active: category.is_active !== false,
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
              ))
            ) : (
              <div className="admin-empty-cell">Aucune catégorie trouvée dans la base de données.</div>
            )}

            <article className="category-card category-card--add">
              <div className="category-add-circle">
                <span className="material-symbols-outlined">add_circle</span>
              </div>
              <h3>Ajouter une nouvelle section</h3>
              <p>Développez votre boutique avec de nouvelles spécialités.</p>
            </article>
          </div>
        </article>

        <aside className="category-side-column">
          <article className="category-performance">
            <div className="category-section-head">
              <span className="material-symbols-outlined">trending_up</span>
              <h3>Performance par Catégorie</h3>
            </div>

            <div className="category-bars">
              {categoryPerformance.length ? (
                categoryPerformance.map((category) => (
                  <div className="category-bar-row" key={category.id}>
                    <div className="category-bar-row__top">
                      <strong>{category.name}</strong>
                      <span>{category.products_count ?? 0} produits</span>
                    </div>
                    <div className="category-bar-track">
                      <div style={{ width: `${category.percent}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="admin-empty-cell">Aucune donnée de performance disponible.</div>
              )}
            </div>
          </article>

          <article className="category-promo">
            <span className="category-promo__pill">Promo du Mois</span>
            <div className="category-promo__content">
              <div>
                <h3>Mise en avant Automnale</h3>
                <p>Utilisez les catégories les plus actives pour booster leur visibilité dans la vitrine marketplace.</p>
                <a href="/admin/categories">En savoir plus →</a>
              </div>
              <div className="category-promo__image" />
            </div>
          </article>

          <article className="category-form-panel">
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
              <label className="category-toggle">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
                />
                <span>Catégorie active</span>
              </label>
              <div className="category-form__actions">
                <button className="button" type="submit">
                  {form.id ? 'Enregistrer' : 'Créer'}
                </button>
                <button
                  className="button--ghost button--ghost-dark"
                  type="button"
                  onClick={() => setForm({ id: null, name: '', description: '', is_active: true })}
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
                <span>Top catégorie</span>
                <strong>{stats.topCategory?.name || 'N/A'}</strong>
              </div>
              <div>
                <span>Produits</span>
                <strong>{stats.totalProducts}</strong>
              </div>
            </div>
          </article>
        </aside>
      </section>
    </div>
  )
}

export default CategoryManagement
