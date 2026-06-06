import { useEffect, useState } from 'react'
import { getAdminCategories } from '../../api/adminService'

function CategoryManagement() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    let active = true

    async function load() {
      const payload = await getAdminCategories()
      if (!active) return
      setCategories(Array.isArray(payload) ? payload : payload.data || [])
    }

    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="workspace-page">
      <section className="page-hero">
        <div>
          <span className="tag">Gestion catégorie</span>
          <h1>Organisez les familles produits avec une structure lisible.</h1>
          <p>Ajoutez, renommez ou priorisez les catégories qui portent le catalogue.</p>
        </div>

        <div className="surface-card">
          <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="metric">
              <span>Catégories</span>
              <strong>24</strong>
            </div>
            <div className="metric">
              <span>Principales</span>
              <strong>8</strong>
            </div>
            <div className="metric">
              <span>En attente</span>
              <strong>3</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-card">
        <div className="toolbar" style={{ marginBottom: '1rem' }}>
          <div>
            <h2>Catégories du catalogue</h2>
            <p>Gardez une nomenclature propre et cohérente.</p>
          </div>
          <div className="action-row">
            <button className="button">Nouvelle catégorie</button>
            <button className="button--ghost">Importer</button>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Produits</th>
              <th>État</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id || category.name}>
                <td>{category.name}</td>
                <td>{category.products_count ?? category.products?.length ?? '-'}</td>
                <td>
                  <span className={`tag ${category.is_active ? 'tag--success' : 'tag--warn'}`}>
                    {category.is_active ? 'Actif' : 'À revoir'}
                  </span>
                </td>
                <td>
                  <div className="action-row">
                    <button className="button--ghost">Modifier</button>
                    <button className="button--ghost">Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default CategoryManagement
