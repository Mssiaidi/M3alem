import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { addCartItem, notifyCartUpdated } from '../../api/cartService'
import { getCategories, getProductsPage } from '../../api/catalogService'

const fallbackProductImage = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80'

function getProductImage(product) {
  return product.images?.[0]?.path || fallbackProductImage
}

function formatPrice(price) {
  return `${Number(price || 0).toLocaleString('fr-FR')} DH`
}

function formatRating(product) {
  if (!product.rating_avg) return 'Nouveau'
  return Number(product.rating_avg).toFixed(1)
}

function readFilters(search) {
  const params = new URLSearchParams(search)

  return {
    category: params.get('category') || '',
    search: params.get('search') || '',
    max_price: params.get('max_price') || '1500',
    sort: params.get('sort') || 'newest',
    page: Number(params.get('page') || 1),
  }
}

function Catalogue() {
  const location = useLocation()
  const navigate = useNavigate()
  const filters = useMemo(() => readFilters(location.search), [location.search])
  const [draftFilters, setDraftFilters] = useState(filters)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [addingId, setAddingId] = useState(null)

  useEffect(() => {
    setDraftFilters(filters)
  }, [filters])

  useEffect(() => {
    let active = true
    setLoading(true)

    Promise.all([
      getCategories(),
      getProductsPage({
        ...filters,
        per_page: 6,
      }),
    ])
      .then(([categoryData, productPage]) => {
        if (!active) return
        setCategories(Array.isArray(categoryData) ? categoryData : [])
        setProducts(productPage.data || [])
        setPagination({
          currentPage: productPage.current_page || 1,
          lastPage: productPage.last_page || 1,
          total: productPage.total || 0,
        })
      })
      .catch(() => {
        if (!active) return
        setProducts([])
        setPagination(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [filters])

  const updateUrl = (nextFilters) => {
    const params = new URLSearchParams()

    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value && !(key === 'page' && Number(value) === 1)) {
        params.set(key, value)
      }
    })

    navigate(`/catalogue${params.toString() ? `?${params}` : ''}`)
  }

  const applyFilters = (event) => {
    event.preventDefault()
    updateUrl({ ...draftFilters, page: 1 })
  }

  const changeSort = (event) => {
    updateUrl({ ...filters, sort: event.target.value, page: 1 })
  }

  const changePage = (page) => {
    updateUrl({ ...filters, page })
  }

  const clearFilters = () => {
    navigate('/catalogue')
  }

  const handleAddToCart = async (productId) => {
    setMessage('')
    setAddingId(productId)

    try {
      await addCartItem(productId, 1)
      notifyCartUpdated(1)
    } catch (error) {
      setMessage(error.message || 'Connectez-vous comme client pour ajouter au panier.')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="catalogue-page">
      <aside className="catalogue-filters">
        <form className="catalogue-filters__panel" onSubmit={applyFilters}>
          <div className="catalogue-filters__head">
            <h2>Filtres</h2>
          </div>

          <label className="catalogue-field">
            <span>Recherche</span>
            <input
              onChange={(event) => setDraftFilters({ ...draftFilters, search: event.target.value })}
              placeholder="Produit, boutique, categorie..."
              type="search"
              value={draftFilters.search}
            />
          </label>

          <section className="catalogue-filter-section">
            <h3>Categories</h3>
            <label className="catalogue-check">
              <input
                checked={!draftFilters.category}
                name="category"
                onChange={() => setDraftFilters({ ...draftFilters, category: '' })}
                type="radio"
              />
              <span>Toutes les categories</span>
            </label>
            {categories.map((category) => (
              <label className="catalogue-check" key={category.id}>
                <input
                  checked={draftFilters.category === category.slug}
                  name="category"
                  onChange={() => setDraftFilters({ ...draftFilters, category: category.slug })}
                  type="radio"
                />
                <span>{category.name}</span>
              </label>
            ))}
          </section>

          <section className="catalogue-filter-section">
            <h3>Prix maximum</h3>
            <input
              max="1500"
              min="0"
              onChange={(event) => setDraftFilters({ ...draftFilters, max_price: event.target.value })}
              step="50"
              type="range"
              value={draftFilters.max_price}
            />
            <div className="catalogue-range">
              <span>0 DH</span>
              <strong>{draftFilters.max_price} DH</strong>
            </div>
          </section>

          <button className="catalogue-reset" onClick={clearFilters} type="button">
            Reinitialiser
          </button>
          <button className="button catalogue-apply" type="submit">Appliquer les filtres</button>
        </form>
      </aside>

      <section className="catalogue-results">
        <div className="catalogue-results__head">
          <div>
            <h1>Produits d'Exception</h1>
            <p>Decouvrez des pieces uniques faconnees a la main par nos maitres artisans.</p>
          </div>
          <label className="catalogue-sort">
            <span>Trier par:</span>
            <select onChange={changeSort} value={filters.sort}>
              <option value="newest">Nouveautes</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix decroissant</option>
              <option value="rating_desc">Mieux notes</option>
            </select>
          </label>
        </div>

        {message && <p className="catalogue-message">{message}</p>}

        {loading ? (
          <p className="muted">Chargement des produits...</p>
        ) : (
          <>
            <div className="catalogue-grid">
              {products.map((product) => (
                <article className="catalogue-card" key={product.id}>
                  <Link className="catalogue-card__media" to={`/products/${product.slug}`}>
                    <span className="catalogue-card__badge">Nouveau</span>
                    <img src={getProductImage(product)} alt={product.images?.[0]?.alt_text || product.name} />
                  </Link>
                  <div className="catalogue-card__body">
                    <div className="catalogue-card__meta">
                      <span>{product.category?.name || 'Artisanat'}</span>
                      <strong>
                        <span aria-hidden="true">★</span>
                        {formatRating(product)}
                      </strong>
                    </div>
                    <Link className="catalogue-card__title" to={`/products/${product.slug}`}>
                      {product.name}
                    </Link>
                    <p>{product.description}</p>
                    <div className="catalogue-card__footer">
                      <span>{formatPrice(product.price)}</span>
                      <button
                        aria-label={`Ajouter ${product.name} au panier`}
                        disabled={addingId === product.id}
                        onClick={() => handleAddToCart(product.id)}
                        type="button"
                      >
                        {addingId === product.id ? '...' : '+'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {products.length === 0 && (
              <p className="catalogue-empty">Aucun produit ne correspond aux filtres.</p>
            )}

            {pagination && pagination.lastPage > 1 && (
              <nav className="catalogue-pagination" aria-label="Pagination catalogue">
                <button
                  disabled={pagination.currentPage === 1}
                  onClick={() => changePage(pagination.currentPage - 1)}
                  type="button"
                >
                  ‹
                </button>
                {Array.from({ length: pagination.lastPage }, (_, index) => index + 1).map((page) => (
                  <button
                    className={page === pagination.currentPage ? 'is-active' : ''}
                    key={page}
                    onClick={() => changePage(page)}
                    type="button"
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={pagination.currentPage === pagination.lastPage}
                  onClick={() => changePage(pagination.currentPage + 1)}
                  type="button"
                >
                  ›
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default Catalogue
