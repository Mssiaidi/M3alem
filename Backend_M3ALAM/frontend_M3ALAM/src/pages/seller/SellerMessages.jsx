import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSellerMessages } from '../../api/sellerService'

function formatDate(value) {
  if (!value) return 'Récemment'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Récemment'
  return date.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function SellerMessages() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedThreadKey, setSelectedThreadKey] = useState(null)
  const [reply, setReply] = useState('')

  useEffect(() => {
    let active = true
    getSellerMessages()
      .then((payload) => {
        if (!active) return
        setMessages(Array.isArray(payload) ? payload : payload.data || [])
      })
      .catch((err) => {
        if (!active) return
        setError(err.message || 'Impossible de charger les messages.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const threads = useMemo(() => {
    const grouped = new Map()

    messages.forEach((message) => {
      const threadKey = message.sender_email
        ? `client:${message.sender_email.toLowerCase()}`
        : message.order_id
          ? `order:${message.order_id}`
          : `shop:${message.shop_id || message.id}`

      const existing = grouped.get(threadKey)
      const lastActivity = message.created_at ? new Date(message.created_at).getTime() : 0

      if (!existing) {
        grouped.set(threadKey, {
          key: threadKey,
          title: message.sender_name || message.shop_name || 'Conversation',
          subtitle: message.sender_email || message.reference || 'Message interne',
          unreadCount: message.read_at ? 0 : 1,
          lastActivity,
          messages: [message],
        })
        return
      }

      existing.messages.push(message)
      existing.unreadCount += message.read_at ? 0 : 1
      if (lastActivity > existing.lastActivity) {
        existing.lastActivity = lastActivity
        existing.subtitle = message.sender_email || message.reference || 'Message interne'
        existing.title = message.sender_name || message.shop_name || existing.title
      }
    })

    return [...grouped.values()].sort((a, b) => b.lastActivity - a.lastActivity)
  }, [messages])

  const unreadCount = useMemo(
    () => threads.reduce((sum, thread) => sum + thread.unreadCount, 0),
    [threads],
  )
  const selectedThread = threads.find((thread) => thread.key === selectedThreadKey) || threads[0] || null

  const handleSendReply = () => {
    if (!selectedThread) return

    const latestMessage = selectedThread.messages[0]
    const subject = encodeURIComponent(latestMessage.reference ? `Commande ${latestMessage.reference}` : `Message ${selectedThread.title || ''}`)
    const body = encodeURIComponent(reply || `Bonjour, je reviens vers vous.`)

    if (latestMessage.sender_email) {
      window.location.href = `mailto:${latestMessage.sender_email}?subject=${subject}&body=${body}`
      return
    }

    if (latestMessage.order_id) {
      navigate(`/seller/orders/${latestMessage.order_id}`)
    }
  }

  if (loading) return <p className="muted">Chargement des messages...</p>

  return (
    <div className="seller-messages-page">
      <header className="seller-messages-head">
        <div>
          <span className="seller-messages-eyebrow">Boîte de réception</span>
          <h1>Messages reçus</h1>
          <p>Lis les messages envoyés depuis la boutique et réponds directement depuis cet espace.</p>
        </div>
        <div className="seller-messages-head__meta">
          <strong>{messages.length}</strong>
          <span>{unreadCount} non lus</span>
        </div>
      </header>

      {error ? <p className="error-text">{error}</p> : null}

      <section className="seller-messages-layout">
        <aside className="seller-messages-list">
          {threads.length > 0 ? (
            threads.map((thread) => (
              <button
                key={thread.key}
                className={`seller-messages-item${selectedThread?.key === thread.key ? ' is-active' : ''}`}
                type="button"
                onClick={() => {
                  setSelectedThreadKey(thread.key)
                  setReply('')
                }}
              >
                <div className="seller-messages-item__top">
                  <strong>{thread.title}</strong>
                  <span>{formatDate(thread.messages[0]?.created_at)}</span>
                </div>
                <p>{thread.messages[0]?.message}</p>
                <small>
                  {thread.subtitle} · {thread.messages.length} message{thread.messages.length > 1 ? 's' : ''}
                </small>
                {thread.unreadCount > 0 ? <span className="seller-messages-item__badge">{thread.unreadCount} non lu{thread.unreadCount > 1 ? 's' : ''}</span> : null}
              </button>
            ))
          ) : (
            <div className="seller-messages-empty">Aucun message pour le moment.</div>
          )}
        </aside>

        <section className="seller-messages-panel">
          {selectedThread ? (
            <>
              <div className="seller-messages-panel__head">
                <div>
                  <span className="seller-messages-panel__type">
                    {selectedThread.messages[0]?.sender_email ? 'Conversation client' : 'Conversation commande'}
                  </span>
                  <h2>{selectedThread.title}</h2>
                  <p>{selectedThread.subtitle}</p>
                </div>
                {selectedThread.messages[0]?.order_id ? (
                  <Link className="seller-messages-panel__link" to={`/seller/orders/${selectedThread.messages[0].order_id}`}>
                    Ouvrir la commande
                  </Link>
                ) : null}
              </div>

              <article className="seller-messages-thread">
                {selectedThread.messages.slice().reverse().map((item) => (
                  <div className="seller-messages-thread__bubble seller-messages-thread__bubble--incoming" key={item.id}>
                    <strong>{item.sender_name || item.shop_name || 'Client'}</strong>
                    <p>{item.message}</p>
                    <small>
                      {formatDate(item.created_at)}
                      {item.attachment_path ? ' · Pièce jointe disponible dans le dossier média.' : ''}
                    </small>
                  </div>
                ))}

                <div className="seller-messages-thread__bubble seller-messages-thread__bubble--outgoing">
                  <strong>Votre réponse</strong>
                  <textarea
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Écris ta réponse..."
                    rows={5}
                  />
                  <div className="seller-messages-thread__actions">
                    <button className="button" type="button" onClick={handleSendReply}>
                      Répondre
                    </button>
                    <button className="button seller-messages-thread__reset" type="button" onClick={() => setReply('')}>
                      Réinitialiser
                    </button>
                  </div>
                </div>
              </article>
            </>
          ) : (
            <div className="seller-messages-empty seller-messages-empty--panel">
              Sélectionne un message pour voir le détail et répondre.
            </div>
          )}
        </section>
      </section>
    </div>
  )
}

export default SellerMessages
