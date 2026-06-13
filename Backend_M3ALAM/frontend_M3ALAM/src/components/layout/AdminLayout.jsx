import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthToken } from '../../api/api'
import { getProfile, logoutLocal } from '../../api/authService'
import DashboardLayout from './DashboardLayout'

const adminLinks = [
  { label: 'Dashboard', path: '/admin/dashboard' },
  { label: 'Utilisateurs', path: '/admin/users' },
  { label: 'Boutiques', path: '/admin/shops' },
  { label: 'Categories', path: '/admin/categories' },
  { label: 'Avis', path: '/admin/reviews' },
]

function AdminLayout({ children }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let active = true

    if (!getAuthToken()) {
      setStatus('guest')
      navigate('/login', { replace: true })
      return undefined
    }

    getProfile()
      .then((user) => {
        if (!active) return

        if (user?.role !== 'admin') {
          setStatus('forbidden')
          logoutLocal()
          navigate('/login', { replace: true })
          return
        }

        setStatus('allowed')
      })
      .catch(() => {
        logoutLocal()
        if (active) {
          setStatus('guest')
          navigate('/login', { replace: true })
        }
      })

    return () => {
      active = false
    }
  }, [navigate])

  return (
    <DashboardLayout links={adminLinks} title="Espace admin">
      {status === 'allowed' ? children : <p className="muted">Verification de votre session...</p>}
    </DashboardLayout>
  )
}

export default AdminLayout
