import DashboardLayout from './DashboardLayout'

const sellerLinks = [
  { label: 'Dashboard', path: '/seller/dashboard' },
  { label: 'Boutique', path: '/seller/shop' },
  { label: 'Produits', path: '/seller/products' },
  { label: 'Nouveau produit', path: '/seller/products/new' },
  { label: 'Commandes', path: '/seller/orders' },
]

function SellerLayout({ children }) {
  return (
    <DashboardLayout links={sellerLinks} title="Espace vendeur">
      {children}
    </DashboardLayout>
  )
}

export default SellerLayout
