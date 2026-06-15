import { useEffect, useMemo, useRef, useState } from 'react'
import { getClientMessages, markClientMessageRead, replyClientMessage } from '../../api/clientMessageService'

function formatDate(value) {
  if (!value) return 'Récemment'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Récemment'
  return date.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function ClientMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedThreadKey, setSelectedThreadKey] = useState(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const replyRef = useRef(null)

  useEffect(() => {
    let active = true
    getClientMessages()
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
      const threadKey = message.thread_key || (message.sender_email
        ? `client:${message.sender_email.toLowerCase()}`
        : message.order_id
          ? `order:${message.order_id}`
          : `shop:${message.shop_id || message.id}`)
      const existing = grouped.get(threadKey)
      const lastActivity = message.created_at ? new Date(message.created_at).getTime() : 0

      if (!existing) {
        grouped.set(threadKey, {
          key: threadKey,
          title: message.sender_name || message.shop_name || (message.reference ? `Commande ${message.reference}` : 'Conversation'),
          subtitle: message.sender_email || message.reference || message.sender_role || 'Message',
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
        existing.subtitle = message.sender_email || message.reference || message.sender_role || 'Message'
        existing.title = message.sender_name || message.shop_name || existing.title
      }
    })

    return [...grouped.values()].sort((a, b) => b.lastActivity - a.lastActivity)
  }, [messages])

  const unreadCount = useMemo(() => threads.reduce((sum, thread) => sum + thread.unreadCount, 0), [threads])
  const selectedThread = threads.find((thread) => thread.key === selectedThreadKey) || threads[0] || null

  useEffect(() => {
    if (!selectedThread) return
    setReply('')
    markClientMessageRead(selectedThread.key).catch(() => {})
    const timer = window.setTimeout(() => replyRef.current?.focus(), 50)
    return () => window.clearTimeout(timer)
  }, [selectedThread?.key])

  const handleReply = async () => {
    if (!selectedThread || !reply.trim()) return
    setSending(true)
    try {
      await replyClientMessage({ thread_key: selectedThread.key, message: reply })
      const refreshed = await getClientMessages()
      setMessages(Array.isArray(refreshed) ? refreshed : refreshed.data || [])
      setReply('')
    } catch (err) {
      setError(err.message || 'Impossible d’envoyer la réponse.')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <p className="muted">Chargement des messages...</p>

  return (
    <div className="seller-messages-page client-messages-page">
      <header className="seller-messages-head">
        <div>
          <span className="seller-messages-eyebrow">Boîte de réception client</span>
          <h1>Mes messages</h1>
          <p>Retrouve ici les conversations liées aux commandes et aux boutiques.</p>
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
                    {selectedThread.messages[0]?.sender_role === 'admin'
                      ? 'Réponse admin'
                      : selectedThread.messages[0]?.sender_email
                        ? 'Conversation vendeur'
                        : 'Conversation commande'}
                  </span>
                  <h2>{selectedThread.title}</h2>
                  <p>{selectedThread.subtitle}</p>
                </div>
              </div>

              <article className="seller-messages-thread">
                {selectedThread.messages.slice().reverse().map((item) => (
                  <div className="seller-messages-thread__bubble seller-messages-thread__bubble--incoming" key={item.id}>
                    <strong>{item.sender_name || item.shop_name || 'Expéditeur'}</strong>
                    <p>{item.message}</p>
                    <small>{formatDate(item.created_at)}</small>
                  </div>
                ))}

                <div className="seller-messages-thread__bubble seller-messages-thread__bubble--outgoing">
                  <strong>Votre réponse</strong>
                  <textarea
                    ref={replyRef}
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Écris ton message..."
                    rows={5}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        handleReply()
                      }
                    }}
                  />
                  <div className="seller-messages-thread__actions">
                    <button className="button" type="button" onClick={handleReply} disabled={sending}>
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
            <div className="seller-messages-empty seller-messages-empty--panel">Sélectionne un message pour voir le détail.</div>
          )}
        </section>
      </section>
    </div>
  )
}

export default ClientMessages
