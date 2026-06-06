import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories, getProducts } from '../../api/catalogService'

const heroImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtjN42VSuaH3nhNjfepS5UxVbcr9-MC6XCtcJwkkDlr2lR2YqROsOLQvc2tMHZ3qghDn9SUdXSjBwnjNDmocmORiCdvXbdkMzkDcbfQ1zcr_Y3gKMrRTXFe5VwRhspMaYQ47ZNNpoa6LQinoFgBr96IejrEcVJhQOh_m-SXydkXZI0-yGx_Z5sXxzp4oRQGLoq6IWoZLNlJatDnaOcqnRvS9J-9P4Z9QHOCmK-nqvgXhv_-T1BL8EN6L6R0n-O4voK6_x4f0yhik4'

const categoryImages = {
  'ceramique-poterie': 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2nmK79ZEMDJ9jfGNpZ1j98ing5AnYeVio5_ngs8kj_aeQUUiENLPrfGSY2NRLfVjjtLaE5g9l6gGGSuzvBaFcFg9J7309jvdJ7HcaXnZPTrBske7pZQBYIrESDNcVQWubSV0s8ygSQ1Zcn4y1Lrl-5vvZe0FYVmbg5piVWfue5k9u-kdWDHEniO0d-VXwtn9AJHCGEZljpIt1L-QIy-FaB7ZvnRJmQQTGbJh2UJs8dw5lTEnLu5D-954E04mCDQuc6tCK7BbpDIc',
  maroquinerie: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCn9WCIgkokEZDedRN3J5zmr1vCL2IJUknc_vAjD3r6Zgi_qmnuLOfyuM1QvEve4fXiBxQaFKZhLFgnz43aVZhkKLhmXV8RnPnxkJQInKkkdN2V0H_zWXzQ0MYCORqNHRbR1kB-n9f7v0XEARwdzMQbPTgspshVC1xwBEtTtZfZDN9pr1ZLsrVFMjpKvoUbMPbBKKM51BosHeO4nU8RN33gYv_gaScY71EuIhWd2U7Ixui9WpQyqTHlfjEuFdxw8M8Cyp3efsgtYcs',
  'tapis-tissage': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRZMTOBzKtqnXs-zOHwuVtxO50_2IELrMKKwvKGh1rRt-hWI0uniprMP30CCB4s-Fi7KbwY6pLJEceJpSJXnvOwejwOop3WhgORiS4zQhVfJVCN4idQFPqywa66VV1wzAaSq8K2W4tipjzuWHrHT6eln7Z3_n6WE4sUlC-VSTudD4f2BLa5gfYTCCKcbhY7e03VON-YjlrgH2rxozvmkOPXtQSg6vb29jbE5yk0eNSm5YlczZCI1cMXDzsMuSKAXcEaNmtoBo0vzA',
  'dinanderie-cuivre': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdqWQs77OlT2G93D7_9gCXGx9STLicn3bVB1Toq2T5R6Z7JksQT-PLsz9AoDH8moLeSWmWmSE5GZ76oYNXnPqAsu2oO4Wgy0pRM1a1q_whu-4b8ORNCzNQ2luWBPjO7BB7rB4c2dxIyxZqYf95VRbfBGVPiSuR2TKlxtXMKUBIfGKFJDXsr2JZrOHZ20rIh1WF5eus_J3TnauCXdNiQDgW9lk7VEPH2MGR8_9JdqxLNdlzUm8Sc1JuYppS2cgzmXfspH3pYvPEpYk',
}

const fallbackCategoryImage = 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=80'
const fallbackProductImage = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80'

function getImage(product) {
  return product?.images?.[0]?.path || fallbackProductImage
}

function formatPrice(price) {
  return `${Number(price || 0).toLocaleString('fr-FR')} DH`
}

function formatRating(product) {
  if (!product.rating_avg) return 'Nouveau'
  return Number(product.rating_avg).toFixed(1)
}

function Accueil() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([getCategories(), getProducts()])
      .then(([categoryData, productData]) => {
        if (!active) return
        setCategories(Array.isArray(categoryData) ? categoryData : [])
        setProducts(Array.isArray(productData) ? productData : [])
      })
      .catch(() => {
        if (!active) return
        setCategories([])
        setProducts([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const topCategories = useMemo(
    () => [...categories]
      .sort((first, second) => (second.products_count || 0) - (first.products_count || 0))
      .slice(0, 4),
    [categories],
  )

  const featuredProducts = products.slice(0, 4)

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__inner">
          <div className="home-hero__content">
            <h1>L'excellence de l'artisanat marocain a votre portee.</h1>
            <p>
              Decouvrez une selection rigoureuse d'objets uniques faconnes par
              les meilleurs M3alems. Qualite, tradition et modernite reunies.
            </p>
            <div className="home-hero__actions">
              <Link className="button" to="/catalogue">Explorer les produits</Link>
              <Link className="button--ghost" to="/register">Devenir Exposant</Link>
            </div>
          </div>

          <div className="home-hero__visual">
            <img src={heroImage} alt="Artisan marocain sculptant du bois" />
          </div>
        </div>
      </section>

      <section className="section home-section">
        <div className="section__head">
          <div>
            <h2>Categories d'Exception</h2>
            <p>Parcourez nos univers artisanaux</p>
          </div>
          <Link className="section__action" to="/catalogue">Voir tout</Link>
        </div>

        <div className="bento">
          {topCategories.map((category, index) => (
            <Link
              className={`tile ${index === 0 ? 'tile--large' : ''} ${index === 3 ? 'tile--wide' : ''}`}
              key={category.id}
              to={`/catalogue?category=${category.slug}`}
            >
              <img
                src={categoryImages[category.slug] || fallbackCategoryImage}
                alt={category.name}
              />
              <div className="tile__overlay">
                <div>
                  <h3>{category.name}</h3>
                  <p>{category.products_count || 0} produits</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="featured home-featured">
        <div className="section__head">
          <h2>Produits en Vedette</h2>
          <Link className="section__action" to="/catalogue">Voir tout le catalogue</Link>
        </div>

        {loading ? (
          <p className="muted">Chargement des produits...</p>
        ) : (
          <div className="products">
            {featuredProducts.map((product) => (
              <Link className="product product-link" key={product.id} to={`/products/${product.slug}`}>
                <div className="product__media">
                  <img src={getImage(product)} alt={product.images?.[0]?.alt_text || product.name} />
                  <span className="product__badge product__badge--secondary">Best Seller</span>
                </div>
                <div className="product__body">
                  <p>{product.category?.name || 'Artisanat marocain'}</p>
                  <h4>{product.name}</h4>
                  <div className="product__meta">
                    <span className="product__price">{formatPrice(product.price)}</span>
                    <span className="product__rating" aria-label={`Note ${formatRating(product)}`}>
                      <span aria-hidden="true">★</span>
                      {formatRating(product)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="spotlight home-section">
        <div>
          <h2>Rencontrez nos M3alems</h2>
          <p>
            Derriere chaque produit se cache une histoire, un savoir-faire
            transmis de generation en generation. Decouvrez les visages de
            l'artisanat marocain.
          </p>
          <div className="spotlight__stats">
            <div className="stat">
              <span className="stat__badge stat__badge--primary">50+</span>
              <strong>Artisans certifies</strong>
            </div>
            <div className="stat">
              <span className="stat__badge stat__badge--secondary">12</span>
              <strong>Villes representees</strong>
            </div>
          </div>
        </div>

        <div className="spotlight__images">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVzcFlcp6yiST1JR6bXQWVcrQJsX7Msnt5B_naiDG8x5EiJWDSmZ2L4i7rUOcc5LBpwtGfNDtexQSgJQd60fW4ZEfXD0SciiUTTES_wrTbE-_S1dYDxn8nGM8iQR-Mgopq-JWt1uFz5OaQVdRBiSQSr__P7qMIjcoM96wnKQWAbI1HHeB-0LIayznxvpMHXv-0v0T6XX4cWmAjnzR8Gnmy4qp4aBJiDiNOzwHmuYYgkJ8-cPbsvNzWrp4wToQVB3spkvNJjSPp6RQ"
            alt="Artisan travaillant le cuir"
          />
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_g457GytyrvAtvMmbIPwuiid3w1wbuiwqy8XozsVX38pKfWlrl1cLfDVBCOSeWV10Kuc1Isa8IhNnPcMu7xSGTanIYZnHLo1nnB3KpzuFwzJXBdvzbA2XuFdULbQLFhYDvRPeTBvcYQdpldJIbKXwvJJwcwJZgc2srZwfWMnCZfJGPH-1yYx8CGrWyzWiMwzgmhp3fKR6kQLGTcSnRHqlMqm6M6NIiq0LKU9Av75TqvrIFGOMAYo-wPnZr9vWZA4EBRg5wdkrwxA"
            alt="Artisane peignant une ceramique"
          />
        </div>
      </section>
    </div>
  )
}

export default Accueil
