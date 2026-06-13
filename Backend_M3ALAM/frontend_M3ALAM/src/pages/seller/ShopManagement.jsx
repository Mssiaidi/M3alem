import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSellerProducts, getSellerShop, updateProduct } from '../../api/sellerService'

const fallbackProduct = {
  id: null,
  name: 'Vase en Céramique Bleue Azur',
  description:
    "Pièce unique façonnée à la main selon la technique du tournage traditionnel. L'émail bleu azur présente des nuances organiques dues à la cuisson haute température...",
  price: 85,
  stock: 1,
  images: [
    {
      path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDK8kT635UPUvbEw1YLbgmjROn_fw1NoTxNlOms6GV7X2cHTFiJg5cw-6r-dx-L4kA_geXXsqzOabbCSv88kd4roXcleS8EZANFE4mGeSmBAf-XSw4a8FN0zBJaOTfPLFlE-ttBekQfe_uRO1qsknk7z0jCG4GH3h3ZNsDZJG9PONIkKgXTEXa9P_22FMjuUjjaqoQyZOo7Ig8Eru2_pQ-TRB1pJNGSxXl1mwbcUl0NzReyEDrydTW1L50WjAJbr9yacdmxEI6kiBA',
      alt_text: 'Vase en céramique bleue',
    },
    {
      path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDuyBss4ZvfRimw9yzpz5kJmVJzXdDRvyxmbae1M4b-POeDOG9IbPq0ENrcpXbch7R7js4pFgnF_Kno6zEV7OVKuQoEZIpo1nDTX9uok1t6ZaEf9QtfsHNtG67AcZ_D2S2tzien5B5CarZG6K1g6OMv_J3jvnOT6Mk6Lu8C1Hcj0R79VsalDYFyIvWBT3eUVBVsa92A8cmsMmqXjrECiahiSRxmWpJAZ-OaD6fUdGyt83P0sKTkLFW32M2UUbcnfW4RiEVQg81OhU',
      alt_text: 'Processus de fabrication',
    },
  ],
}

const fallbackPreview = {
  badge: 'NOUVEAU',
  title: 'Vase Céramique Azur',
  store: 'Par Atelier M3alem',
  price: 85,
  reviews: 12,
  excerpt: '"Pièce unique façonnée à la main selon la technique du tournage traditionnel..."',
}

function formatPrice(value) {
  const amount = Number.parseFloat(value || 0)

  return `${amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} DH`
}

function toFormProduct(product) {
  const images = Array.isArray(product?.images) && product.images.length > 0 ? product.images : fallbackProduct.images

  return {
    id: product?.id ?? fallbackProduct.id,
    name: product?.name ?? fallbackProduct.name,
    description: product?.description ?? fallbackProduct.description,
    price: product?.price ?? fallbackProduct.price,
    stock: product?.stock ?? fallbackProduct.stock,
    images: images.map((image) => ({
      path: image?.path ?? fallbackProduct.images[0].path,
      alt_text: image?.alt_text ?? product?.name ?? fallbackProduct.name,
    })),
  }
}

function ShopManagement() {
  const navigate = useNavigate()
  const galleryInputRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [shop, setShop] = useState(null)
  const [product, setProduct] = useState(toFormProduct(fallbackProduct))
  const [gallery, setGallery] = useState(fallbackProduct.images)

  useEffect(() => {
    let active = true

    Promise.all([getSellerShop().catch(() => null), getSellerProducts().catch(() => [])])
      .then(([shopData, products]) => {
        if (!active) return

        setShop(shopData)

        const firstProduct = Array.isArray(products) && products.length > 0 ? products[0] : fallbackProduct
        const formProduct = toFormProduct(firstProduct)

        setProduct(formProduct)
        setGallery(formProduct.images.slice(0, 2))
        setError('')
      })
      .catch((requestError) => {
        if (!active) return

        setError(requestError.message || 'Impossible de charger la boutique.')
        const formProduct = toFormProduct(fallbackProduct)
        setProduct(formProduct)
        setGallery(formProduct.images.slice(0, 2))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const preview = useMemo(() => {
    const shopName = shop?.name || 'Atelier M3alem'

    return {
      badge: fallbackPreview.badge,
      title: product.name || fallbackPreview.title,
      store: shopName.startsWith('Par ') ? shopName : `Par ${shopName}`,
      price: Number.parseFloat(product.price || fallbackPreview.price),
      reviews: fallbackPreview.reviews,
      excerpt: product.description
        ? `"${product.description.slice(0, 88)}${product.description.length > 88 ? '...' : ''}"`
        : fallbackPreview.excerpt,
      image: gallery[0]?.path || fallbackProduct.images[0].path,
    }
  }, [gallery, product.description, product.name, product.price, shop?.name])

  const healthItems = useMemo(
    () => [
      { label: 'Titre optimisé', filled: true },
      { label: 'Description artisanale', filled: true },
      { label: gallery.length >= 3 ? 'Galerie complète' : 'Ajouter 1 photo supplémentaire', filled: gallery.length >= 3 },
    ],
    [gallery.length],
  )

  const handleFieldChange = (field) => (event) => {
    const { value } = event.target

    setProduct((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (product.id) {
        await updateProduct(product.id, {
          name: product.name,
          description: product.description,
          price: Number.parseFloat(product.price || 0),
          stock: Number.parseInt(product.stock || 0, 10),
          images: gallery.map((image) => image.path).filter(Boolean),
        })
      }

      navigate('/seller/products')
    } catch (submissionError) {
      setError(submissionError.message || 'Impossible d’enregistrer les modifications.')
    } finally {
      setSaving(false)
    }
  }

  const handlePickImage = (index) => {
    const nextImage = fallbackProduct.images[index % fallbackProduct.images.length]
    setGallery((current) => {
      const next = [...current]
      next[index] = nextImage
      return next
    })
  }

  const handleGalleryAdd = (event) => {
    const files = Array.from(event.target.files || [])

    if (files.length === 0) return

    const nextImages = files
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        path: URL.createObjectURL(file),
        alt_text: file.name || product.name,
      }))

    if (nextImages.length > 0) {
      setGallery((current) => [...current, ...nextImages].slice(0, 5))
    }

    event.target.value = ''
  }

  const handlePreviewCart = () => {
    navigate('/cart')
  }

  const handleToggleFavorite = () => {
    setIsFavorite((current) => !current)
  }

  const isDynamicShop = Boolean(shop?.slug)

  if (loading) {
    return (
      <div className="shop-management-loading">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container-highest border-t-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="shop-management-page">
      <div className="shop-management-shell">
        <nav className="shop-management-breadcrumbs">
          <button type="button" onClick={() => navigate('/seller/dashboard')}>
            Dashboard
          </button>
          <span className="material-symbols-outlined">chevron_right</span>
          <button type="button" onClick={() => navigate('/seller/products')}>
            Mes Produits
          </button>
          <span className="material-symbols-outlined">chevron_right</span>
          <span>Éditer l&apos;article</span>
        </nav>

        {error ? <div className="shop-management-error">{error}</div> : null}

        <div className="shop-management-grid">
          <section className="shop-management-card shop-management-editor">
            <div className="shop-management-card__head">
              <h2>Détails de l&apos;Article</h2>
              <span>Brouillon</span>
            </div>

            <form className="shop-management-form" onSubmit={handleSubmit}>
              <div className="shop-management-field">
                <label htmlFor="product-name">Nom du produit</label>
                <input
                  id="product-name"
                  onChange={handleFieldChange('name')}
                  type="text"
                  value={product.name}
                />
                <div className="shop-management-hint">
                  <span className="material-symbols-outlined">lightbulb</span>
                  <p>Utilisez des mots-clés descriptifs comme le matériau ou la technique pour améliorer le référencement.</p>
                </div>
              </div>

              <div className="shop-management-field">
                <label htmlFor="product-description">Description artisanale</label>
                <textarea
                  id="product-description"
                  onChange={handleFieldChange('description')}
                  rows={6}
                  value={product.description}
                />
                <div className="shop-management-hint">
                  <span className="material-symbols-outlined">info</span>
                  <p>Racontez l&apos;histoire de cette pièce. Les acheteurs adorent connaître le processus de création.</p>
                </div>
              </div>

              <div className="shop-management-field">
                <label>Galerie Photos</label>
                <div className="shop-management-gallery">
                  {gallery.map((image, index) => (
                    <div className="shop-management-photo" key={`${image.path}-${index}`}>
                      <img alt={image.alt_text} src={image.path} />
                      <button type="button" onClick={() => handlePickImage(index)}>
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  ))}

                  <button
                    className="shop-management-add-photo"
                    onClick={() => galleryInputRef.current?.click()}
                    type="button"
                  >
                    <span className="material-symbols-outlined">add_a_photo</span>
                    <span>Ajouter</span>
                  </button>
                  <input
                    accept="image/*"
                    aria-label="Ajouter des photos à la galerie"
                    multiple
                    onChange={handleGalleryAdd}
                    ref={galleryInputRef}
                    type="file"
                    style={{ display: 'none' }}
                  />
                </div>

                <div className="shop-management-hint">
                  <span className="material-symbols-outlined">stars</span>
                  <p>Utilisez une lumière naturelle. Les produits avec au moins 3 photos se vendent 40% mieux.</p>
                </div>
              </div>

              <div className="shop-management-split">
                <div className="shop-management-field">
                  <label htmlFor="product-price">Prix (DH)</label>
                  <input
                    id="product-price"
                    min="0"
                    onChange={handleFieldChange('price')}
                    step="0.01"
                    type="number"
                    value={product.price}
                  />
                </div>
                <div className="shop-management-field">
                  <label htmlFor="product-stock">Stock</label>
                  <input
                    id="product-stock"
                    min="0"
                    onChange={handleFieldChange('stock')}
                    type="number"
                    value={product.stock}
                  />
                </div>
              </div>

              <div className="shop-management-actions">
                <button type="button" onClick={() => navigate('/seller/products')}>
                  Annuler
                </button>
                <button disabled={saving} type="submit">
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </section>

          <aside className="shop-management-sidebar">
            <div className="shop-management-sidebar__head">
              <h3>Aperçu Boutique</h3>
              <button type="button" onClick={() => navigate(isDynamicShop ? `/shops/${shop.slug}` : '/catalogue')}>
                <span className="material-symbols-outlined">visibility</span>
                <span>Voir en ligne</span>
              </button>
            </div>

            <div className="shop-management-preview card-elevated">
              <div className="shop-management-preview__media">
                <img alt="Preview Image" src={preview.image} />
                <span>{preview.badge}</span>
              </div>

              <div className="shop-management-preview__body">
                <div className="shop-management-preview__title-row">
                  <div>
                    <h4>{preview.title}</h4>
                    <p>{preview.store}</p>
                  </div>
                  <strong>{formatPrice(preview.price)}</strong>
                </div>

                <div className="shop-management-stars">
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star_half</span>
                  <small>({preview.reviews} avis)</small>
                </div>

                <p className="shop-management-quote">{preview.excerpt}</p>

                <div className="shop-management-preview__actions">
                  <button onClick={handlePreviewCart} type="button">
                    Ajouter au panier
                  </button>
                  <button aria-pressed={isFavorite} onClick={handleToggleFavorite} type="button">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}>
                      {isFavorite ? 'favorite' : 'favorite_border'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="shop-management-health card-soft">
              <h4>Santé de la fiche produit</h4>
              <div className="shop-management-progress">
                <span />
              </div>
              <ul>
                {healthItems.map((item) => (
                  <li key={item.label}>
                    <span className={`material-symbols-outlined${item.filled ? ' is-filled' : ''}`}>
                      {item.filled ? 'check_circle' : 'circle'}
                    </span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default ShopManagement
