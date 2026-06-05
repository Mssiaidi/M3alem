import DashboardLayout from './DashboardLayout'

const adminLinks = [
  { label: 'Dashboard', path: '/admin/dashboard' },
  { label: 'Utilisateurs', path: '/admin/users' },
  { label: 'Boutiques', path: '/admin/shops' },
  { label: 'Categories', path: '/admin/categories' },
  { label: 'Avis', path: '/admin/reviews' },
]

function AdminLayout({ children }) {
  return (
    <DashboardLayout links={adminLinks} title="Espace admin">
      {children}
    </DashboardLayout>
  )
}

export default AdminLayout
