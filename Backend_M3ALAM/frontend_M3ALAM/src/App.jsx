import { Route, Routes } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import AuthLayout from './components/layout/AuthLayout'
import ClientLayout from './components/layout/ClientLayout'
import PublicLayout from './components/layout/PublicLayout'
import SellerLayout from './components/layout/SellerLayout'
import Accueil from './pages/public/Accueil'
import Catalogue from './pages/public/Catalogue'
import ProductDetail from './pages/public/ProductDetail'
import ShopDetail from './pages/public/ShopDetail'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import Cart from './pages/client/Cart'
import Checkout from './pages/client/Checkout'
import LeaveReview from './pages/client/LeaveReview'
import OrderDetail from './pages/client/OrderDetail'
import Orders from './pages/client/Orders'
import SellerDashboard from './pages/seller/SellerDashboard'
import EditProduct from './pages/seller/EditProduct'
import NewProduct from './pages/seller/NewProduct'
import SellerOrderDetail from './pages/seller/SellerOrderDetail'
import SellerOrders from './pages/seller/SellerOrders'
import ShopManagement from './pages/seller/ShopManagement'
import SellerProducts from './pages/seller/SellerProducts'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import ReviewModeration from './pages/admin/ReviewModeration'
import ShopModeration from './pages/admin/ShopModeration'
import CategoryManagement from './pages/admin/CategoryManagement'
import UserManagement from './pages/admin/UserManagement'
import NotFound from './pages/NotFound'
import './App.css'

function publicPage(page) {
  return <PublicLayout>{page}</PublicLayout>
}

function authPage(page) {
  return <AuthLayout>{page}</AuthLayout>
}

function clientPage(page) {
  return <ClientLayout>{page}</ClientLayout>
}

function sellerPage(page) {
  return <SellerLayout>{page}</SellerLayout>
}

function adminPage(page) {
  return <AdminLayout>{page}</AdminLayout>
}

function Shell() {
  return (
    <Routes>
      {/* Personne 1: pages public + achat */}
      <Route path="/" element={publicPage(<Accueil />)} />
      <Route path="/catalogue" element={publicPage(<Catalogue />)} />
      <Route path="/products/:slug" element={publicPage(<ProductDetail />)} />
      <Route path="/shops/:slug" element={publicPage(<ShopDetail />)} />
      <Route path="/login" element={authPage(<Login />)} />
      <Route path="/register" element={authPage(<Register />)} />
      <Route path="/cart" element={clientPage(<Cart />)} />
      <Route path="/checkout" element={clientPage(<Checkout />)} />

      {/* Personne 2: commandes client + vendeur */}
      <Route path="/orders/:id/review" element={clientPage(<LeaveReview />)} />
      <Route path="/orders/:id" element={clientPage(<OrderDetail />)} />
      <Route path="/orders" element={clientPage(<Orders />)} />
      <Route path="/seller/dashboard" element={sellerPage(<SellerDashboard />)} />
      <Route path="/seller/shop" element={sellerPage(<ShopManagement />)} />
      <Route path="/seller/orders/:id" element={sellerPage(<SellerOrderDetail />)} />
      <Route path="/seller/orders" element={sellerPage(<SellerOrders />)} />

      {/* Personne 3: produits vendeur + admin */}
      <Route path="/seller/products/new" element={sellerPage(<NewProduct />)} />
      <Route path="/seller/products/:id/edit" element={sellerPage(<EditProduct />)} />
      <Route path="/seller/products" element={sellerPage(<SellerProducts />)} />
      <Route path="/admin/dashboard" element={adminPage(<AdminDashboard />)} />
      <Route path="/admin/analytics" element={adminPage(<AdminAnalytics />)} />
      <Route path="/admin/users" element={adminPage(<UserManagement />)} />
      <Route path="/admin/reviews" element={adminPage(<ReviewModeration />)} />
      <Route path="/admin/shops" element={adminPage(<ShopModeration />)} />
      <Route path="/admin/categories" element={adminPage(<CategoryManagement />)} />

      <Route path="*" element={publicPage(<NotFound />)} />
    </Routes>
  )
}

export default Shell
