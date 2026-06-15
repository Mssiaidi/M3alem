import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getAuthToken } from '../../api/api'
import { contactShop, getShop } from '../../api/catalogService'

function ShopContact() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [status, setStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sentMessages, setSentMessages] = useState([])

  useEffect(() => {
    let active = true
    getShop(slug)
      .then((data) => {
        if (active) setShop(data)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [slug])

  const previewMessages = useMemo(() => sentMessages.slice(0, 3), [sentMessages])

  const handleAttachmentChange = (event) => {
    const file = event.target.files?.[0] || null
    setAttachment(file)
  }

  const submitMessage = () => {
    const form = document.querySelector('.shop-contact-form')
    if (form) form.requestSubmit()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!shop) return

    if (!getAuthToken()) {
      navigate('/login')
      return
    }

    if (!message.trim()) return

    setSubmitting(true)
    setStatus('')

    try {
      const payload = new FormData()
      payload.append('message', message)
      if (attachment) payload.append('attachment', attachment)

      const response = await contactShop(shop.id, payload)
      const entry = {
        id: `${Date.now()}`,
        message,
        attachmentName: attachment?.name || '',
        sentAt: new Date().toLocaleString('fr-FR'),
      }

      setSentMessages((current) => [entry, ...current])
      setStatus(response?.message || 'Message envoyé au vendeur.')
      setMessage('')
      setAttachment(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      setStatus(error.message || "Impossible d'envoyer le message.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="muted">Chargement...</p>
  if (!shop) return <p className="panel panel--error">Boutique introuvable.</p>

  return (
    <article className="shop-contact-page">
      <nav className="product-breadcrumb" aria-label="Fil d'Ariane">
        <Link to="/">Accueil</Link>
        <span>&gt;</span>
        <Link to={`/shops/${slug}`}>{shop.name}</Link>
        <span>&gt;</span>
        <strong>Contacter</strong>
      </nav>

      <section className="shop-contact-card">
        <div className="shop-contact-card__head">
          <span className="material-symbols-outlined">chat</span>
          <div>
            <h1>Parler avec le vendeur</h1>
            <p>Écris ton message directement dans la plateforme. Tu peux aussi joindre une photo ou un PDF.</p>
          </div>
        </div>

        <div className="shop-contact-card__shop">
          <strong>{shop.name}</strong>
          <span>{shop.city ? `${shop.city}, Maroc` : 'Boutique en ligne'}</span>
        </div>

        <form onSubmit={handleSubmit} className="shop-contact-form">
          <label>
            Ton message
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  submitMessage()
                }
              }}
              placeholder="Bonjour, je veux vous poser une question sur votre boutique..."
              rows={6}
              required
            />
          </label>

          <label className="shop-contact-upload">
            Pièce jointe
            <input
              ref={fileInputRef}
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={handleAttachmentChange}
              type="file"
              className="shop-contact-upload__input"
            />
            <button
              className="shop-contact-upload__button"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="material-symbols-outlined">attach_file</span>
              {attachment ? 'Changer le fichier' : 'Choisir un fichier'}
            </button>
            <span className="shop-contact-upload__note">
              {attachment ? attachment.name : 'Ajoute une photo ou un PDF si besoin'}
            </span>
          </label>

          <div className="shop-contact-actions">
            <button className="button" type="submit" disabled={submitting}>
              {submitting ? 'Envoi...' : 'Envoyer le message'}
            </button>
            <Link className="shop-contact-back" to={`/shops/${slug}`}>
              Retour à la boutique
            </Link>
          </div>

          {status ? <p className="shop-contact-status">{status}</p> : null}
        </form>

        {previewMessages.length > 0 ? (
          <section className="shop-contact-history">
            <h2>Messages envoyés</h2>
            <div className="shop-contact-history__list">
              {previewMessages.map((entry) => (
                <article className="shop-contact-history__item" key={entry.id}>
                  <div className="shop-contact-history__top">
                    <strong>Toi</strong>
                    <span>{entry.sentAt}</span>
                  </div>
                  <p>{entry.message}</p>
                  {entry.attachmentName ? <small>Fichier joint: {entry.attachmentName}</small> : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </article>
  )
}

export default ShopContact
