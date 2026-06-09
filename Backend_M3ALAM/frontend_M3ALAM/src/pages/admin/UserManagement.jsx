import { useEffect, useMemo, useState } from 'react'
import { approveAdminUser, createAdminUser, getAdminUsers } from '../../api/adminService'

const DEFAULT_FORM = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'seller',
}

function UserManagement() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [form, setForm] = useState(DEFAULT_FORM)
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  async function loadUsers() {
    try {
      setLoading(true)
      const payload = await getAdminUsers()
      setUsers(payload?.data || payload || [])
      setError('')
    } catch (err) {
      setError(err.message || 'Impossible de charger les utilisateurs.')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const stats = useMemo(() => {
    const total = users.length
    const admins = users.filter((user) => user.role === 'admin').length
    const sellers = users.filter((user) => user.role === 'seller').length
    const clients = users.filter((user) => user.role === 'client').length
    const pending = users.filter((user) => user.account_status === 'pending').length

    return { total, admins, sellers, clients, pending }
  }, [users])

  const visibleUsers = useMemo(() => {
    const term = query.trim().toLowerCase()
    return users.filter((user) => {
      const matchesQuery =
        !term ||
        `${user.name || ''} ${user.email || ''} ${user.role || ''} ${user.account_status || ''}`.toLowerCase().includes(term)
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus = statusFilter === 'all' || user.account_status === statusFilter
      return matchesQuery && matchesRole && matchesStatus
    })
  }, [query, roleFilter, statusFilter, users])

  const roleLabel = (role) => {
    if (role === 'admin') return 'Administrateur'
    if (role === 'seller') return 'Vendeur'
    return 'Client'
  }

  const roleClass = (role) => {
    if (role === 'admin') return 'tag--danger'
    if (role === 'seller') return 'tag--warn'
    return 'tag--success'
  }

  const statusLabel = (status) => (status === 'pending' ? 'En attente' : 'Actif')
  const statusClass = (status) => (status === 'pending' ? 'tag--warn' : 'tag--success')

  const handleCreate = async (event) => {
    event.preventDefault()
    try {
      setSaving(true)
      await createAdminUser(form)
      setForm(DEFAULT_FORM)
      setCreateOpen(false)
      await loadUsers()
    } catch (err) {
      setError(err.message || 'Impossible de créer le compte.')
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async (userId) => {
    try {
      await approveAdminUser(userId)
      await loadUsers()
      setSelectedUser((current) => (current?.id === userId ? { ...current, account_status: 'active' } : current))
    } catch (err) {
      setError(err.message || "Impossible d’approuver ce compte.")
    }
  }

  return (
    <div className="user-management-shell admin-shell">
      <header className="user-management-head">
        <div>
          <h1>Gestion des Utilisateurs</h1>
          <p>Comptes, rôles et validation depuis la base de données. Les vendeurs et admins passent par approbation.</p>
        </div>
        <button className="button" type="button" onClick={() => setCreateOpen(true)}>
          <span className="material-symbols-outlined">person_add</span>
          Ajouter un compte
        </button>
      </header>

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p className="admin-state-note">Chargement des utilisateurs depuis la base de données...</p> : null}

      <section className="user-kpi-grid">
        <article className="user-kpi-card">
          <span>Total comptes</span>
          <strong>{stats.total}</strong>
        </article>
        <article className="user-kpi-card">
          <span>Admins</span>
          <strong>{stats.admins}</strong>
        </article>
        <article className="user-kpi-card">
          <span>Vendeurs</span>
          <strong>{stats.sellers}</strong>
        </article>
        <article className="user-kpi-card user-kpi-card--highlight">
          <span>En attente</span>
          <strong>{stats.pending}</strong>
        </article>
      </section>

      <section className="user-panel">
        <div className="user-panel__head user-panel__head--stack">
          <div>
            <h2>Comptes</h2>
            <p>Filtre par rôle, statut ou recherche libre.</p>
          </div>

          <div className="user-panel__actions">
            <div className="user-filters">
              <input
                className="user-search__input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un utilisateur"
              />

              <div className="user-filter-row">
                <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                  <option value="all">Tous les rôles</option>
                  <option value="client">Client</option>
                  <option value="seller">Vendeur</option>
                  <option value="admin">Admin</option>
                </select>

                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="pending">En attente</option>
                </select>
              </div>
            </div>

            <button className="button--ghost button--ghost-dark user-refresh" type="button" onClick={loadUsers}>
              <span className="material-symbols-outlined">refresh</span>
              Rafraîchir
            </button>
          </div>
        </div>

        <div className="user-grid user-grid--accounts">
          {visibleUsers.length ? (
            visibleUsers.map((user) => (
              <article className="user-card" key={user.id}>
                <div className="user-card__top">
                  <div className="user-avatar">{String(user.name || 'U').slice(0, 1).toUpperCase()}</div>
                  <div className="user-card__tags">
                    <span className={`tag ${roleClass(user.role)}`}>{roleLabel(user.role)}</span>
                    <span className={`tag ${statusClass(user.account_status)}`}>{statusLabel(user.account_status)}</span>
                  </div>
                </div>

                <div>
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                </div>

                <div className="user-card__meta">
                  <span>{user.orders_count ?? 0} commandes</span>
                  <span>{user.reviews_count ?? 0} avis</span>
                  <span>{user.shop_count ?? 0} boutique{Number(user.shop_count || 0) > 1 ? 's' : ''}</span>
                </div>

                <div className="user-card__actions">
                  <button className="button--ghost button--ghost-dark" type="button" onClick={() => setSelectedUser(user)}>
                    Voir
                  </button>
                  {user.account_status === 'pending' ? (
                    <button className="button" type="button" onClick={() => handleApprove(user.id)}>
                      Valider
                    </button>
                  ) : (
                    <button className="button" type="button" onClick={() => setSelectedUser(user)}>
                      Gérer
                    </button>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="admin-empty-cell">Aucun utilisateur trouvé dans la base de données.</div>
          )}
        </div>
      </section>

      {createOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setCreateOpen(false)}>
          <div className="modal-card modal-card--wide user-modal" role="dialog" aria-modal="true" aria-labelledby="create-user-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-card__head">
              <div>
                <h2 id="create-user-title">Créer un compte</h2>
                <p>Le rôle vendeur/admin sera créé en attente jusqu’à validation.</p>
              </div>
              <button className="icon-button" type="button" onClick={() => setCreateOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form className="user-form user-form--modal" onSubmit={handleCreate}>
              <label>
                Nom
                <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Nom complet" required />
              </label>
              <label>
                Email
                <input value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="email@exemple.com" type="email" required />
              </label>
              <div className="user-form__grid">
                <label>
                  Mot de passe
                  <input value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} placeholder="••••••••" type="password" required />
                </label>
                <label>
                  Confirmation
                  <input value={form.password_confirmation} onChange={(event) => setForm((prev) => ({ ...prev, password_confirmation: event.target.value }))} placeholder="••••••••" type="password" required />
                </label>
              </div>
              <label>
                Rôle
                <select value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}>
                  <option value="client">Client</option>
                  <option value="seller">Vendeur</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              <div className="user-form__note">
                Les vendeurs et admins seront créés en <strong>attente</strong> jusqu’à validation.
              </div>

              <div className="modal-card__actions">
                <button className="button--ghost button--ghost-dark" type="button" onClick={() => setCreateOpen(false)}>
                  Annuler
                </button>
                <button className="button" type="submit" disabled={saving}>
                  <span className="material-symbols-outlined">{saving ? 'hourglass_top' : 'person_add'}</span>
                  {saving ? 'Création...' : 'Créer le compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedUser ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedUser(null)}>
          <div className="modal-card user-modal" role="dialog" aria-modal="true" aria-labelledby="user-detail-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-card__head">
              <div>
                <h2 id="user-detail-title">Voir / Gérer</h2>
                <p>{selectedUser.name} · {selectedUser.email}</p>
              </div>
              <button className="icon-button" type="button" onClick={() => setSelectedUser(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="user-detail">
              <div className="user-detail__hero">
                <div className="user-avatar user-avatar--large">{String(selectedUser.name || 'U').slice(0, 1).toUpperCase()}</div>
                <div>
                  <h3>{selectedUser.name}</h3>
                  <p>{roleLabel(selectedUser.role)} · {statusLabel(selectedUser.account_status)}</p>
                </div>
              </div>

              <div className="user-detail__stats">
                <span>{selectedUser.orders_count ?? 0} commandes</span>
                <span>{selectedUser.reviews_count ?? 0} avis</span>
                <span>{selectedUser.shop_count ?? 0} boutique{Number(selectedUser.shop_count || 0) > 1 ? 's' : ''}</span>
              </div>

              <div className="modal-card__actions">
                <button className="button--ghost button--ghost-dark" type="button" onClick={() => setSelectedUser(null)}>
                  Fermer
                </button>
                {selectedUser.account_status === 'pending' ? (
                  <button className="button" type="button" onClick={() => handleApprove(selectedUser.id)}>
                    Valider l&apos;accès
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default UserManagement
