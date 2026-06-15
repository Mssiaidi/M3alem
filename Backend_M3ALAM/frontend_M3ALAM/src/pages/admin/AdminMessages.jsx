import { useEffect, useMemo, useRef, useState } from 'react'
import { getAdminMessages, markAdminMessageRead, replyAdminMessage } from '../../api/adminService'

function formatDate(value) {
  if (!value) return 'Récemment'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Récemment'
  return date.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedThreadKey, setSelectedThreadKey] = useState(null)
  const [reply, setReply] = useState('')
  const [filter, setFilter] = useState('all')
  const [sending, setSending] = useState(false)
  const replyRef = useRef(null)

  useEffect(() => {
    let active = true

    getAdminMessages()
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
          : message.shop_id
            ? `shop:${message.shop_id}`
            : `message:${message.id}`

      const existing = grouped.get(threadKey)
      const lastActivity = message.created_at ? new Date(message.created_at).getTime() : 0

      if (!existing) {
        grouped.set(threadKey, {
          key: threadKey,
          title: message.sender_name || message.shop_name || (message.reference ? `Commande ${message.reference}` : 'Conversation'),
          subtitle: message.sender_email || message.reference || message.sender_role || 'Message interne',
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
        existing.subtitle = message.sender_email || message.reference || message.sender_role || 'Message interne'
        existing.title = message.sender_name || message.shop_name || existing.title
      }
    })

    return [...grouped.values()].sort((a, b) => b.lastActivity - a.lastActivity)
  }, [messages])

  const unreadCount = useMemo(
    () => threads.reduce((sum, thread) => sum + thread.unreadCount, 0),
    [threads],
  )

  const filteredThreads = useMemo(() => {
    return threads.filter((thread) => {
      const latest = thread.messages[0]
      if (filter === 'all') return true
      if (filter === 'clients') return Boolean(latest?.sender_email) && !latest?.order_id
      if (filter === 'orders') return Boolean(latest?.order_id)
      if (filter === 'internal') return !latest?.sender_email && !latest?.order_id
      return true
    })
  }, [filter, threads])

  const selectedThread = filteredThreads.find((thread) => thread.key === selectedThreadKey)
    || filteredThreads[0]
    || null

  useEffect(() => {
    if (!selectedThread) return
    setReply('')
    markAdminMessageRead(selectedThread.key)
      .then(() => {
        setMessages((current) =>
          current.map((message) => {
            const threadKey = message.sender_email
              ? `client:${message.sender_email.toLowerCase()}`
              : message.order_id
                ? `order:${message.order_id}`
                : message.shop_id
                  ? `shop:${message.shop_id}`
                  : `message:${message.id}`

            return threadKey === selectedThread.key ? { ...message, read_at: message.read_at || new Date().toISOString() } : message
          }),
        )
      })
      .catch(() => {})
    const timer = window.setTimeout(() => {
      replyRef.current?.focus()
    }, 50)
    return () => window.clearTimeout(timer)
  }, [selectedThread?.key])

  const handleSendReply = async () => {
    if (!selectedThread) return
    if (!reply.trim()) return

    setSending(true)
    try {
      await replyAdminMessage({ thread_key: selectedThread.key, message: reply })
      setReply('')
      const refreshed = await getAdminMessages()
      setMessages(Array.isArray(refreshed) ? refreshed : refreshed.data || [])
    } catch (err) {
      setError(err.message || 'Impossible d’envoyer la réponse.')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <p className="muted">Chargement des messages...</p>

  return (
    <div className="seller-messages-page admin-messages-page">
      <header className="seller-messages-head">
        <div>
          <span className="seller-messages-eyebrow">Boîte de réception admin</span>
          <h1>Messages reçus</h1>
          <p>Regroupe ici les contacts reçus sur les commandes et les demandes envoyées vers l&apos;admin.</p>
        </div>
        <div className="seller-messages-head__meta">
          <strong>{messages.length}</strong>
          <span>{unreadCount} non lus</span>
        </div>
      </header>

      {error ? <p className="error-text">{error}</p> : null}

      <section className="seller-messages-layout">
        <aside className="seller-messages-list">
          <div className="admin-messages-filters">
            {[
              { key: 'all', label: 'Tous' },
              { key: 'clients', label: 'Clients' },
              { key: 'orders', label: 'Commandes' },
              { key: 'internal', label: 'Internes' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                className={`chip admin-messages-filter${filter === item.key ? ' is-active' : ''}`}
                onClick={() => setFilter(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {filteredThreads.length > 0 ? (
            filteredThreads.map((thread) => (
              <button
                key={thread.key}
                className={`seller-messages-item${selectedThread?.key === thread.key ? ' is-active' : ''}`}
                type="button"
                onClick={() => setSelectedThreadKey(thread.key)}
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
                    {selectedThread.messages[0]?.sender_email
                      ? 'Conversation client'
                      : selectedThread.messages[0]?.order_id
                        ? 'Conversation commande'
                        : 'Conversation interne'}
                  </span>
                  <h2>{selectedThread.title}</h2>
                  <p>{selectedThread.subtitle}</p>
                </div>
                <button className="seller-messages-panel__link" type="button" onClick={() => replyRef.current?.focus()}>
                  Répondre
                </button>
              </div>

              <article className="seller-messages-thread">
                {selectedThread.messages.slice().reverse().map((item) => (
                  <div className="seller-messages-thread__bubble seller-messages-thread__bubble--incoming" key={item.id}>
                    <strong>{item.sender_name || item.shop_name || 'Expéditeur'}</strong>
                    <p>{item.message}</p>
                    <small>
                      {formatDate(item.created_at)}
                      {item.attachment_path ? ' · Pièce jointe disponible dans le dossier média.' : ''}
                    </small>
                  </div>
                ))}

                <div className="seller-messages-thread__bubble seller-messages-thread__bubble--outgoing">
                  <strong>Réponse admin</strong>
                  <textarea
                    ref={replyRef}
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Écris ta réponse..."
                    rows={5}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        handleSendReply()
                      }
                    }}
                  />
                  <div className="seller-messages-thread__actions">
                    <button className="button" type="button" onClick={handleSendReply} disabled={sending}>
                      {sending ? 'Envoi...' : 'Envoyer'}
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
              Sélectionne un message pour voir le détail.
            </div>
          )}
        </section>
      </section>
    </div>
  )
}

export default AdminMessages
