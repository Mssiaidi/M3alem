function authHeaders() {
  const token = localStorage.getItem('m3alem_token')

  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getProfile() {
  const response = await fetch('/api/user', { headers: authHeaders() })
  if (!response.ok) throw new Error('Erreur de profil')
  return response.json()
}

export async function updateProfile(data) {
  const response = await fetch('/api/user', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Mise a jour impossible')
  return response.json()
}

export async function getSellerProducts() {
  const response = await fetch('/api/seller/products', { headers: authHeaders() })
  if (!response.ok) throw new Error('Erreur produits')
  const payload = await response.json()
  return payload.data ?? payload
}

export async function getProductById(id) {
  const products = await getSellerProducts()
  return products.find(p => p.id === Number(id))
}

export async function createProduct(data) {
  const response = await fetch('/api/seller/products', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur creation')
  return response.json()
}

export async function updateProduct(id, data) {
  const response = await fetch(`/api/seller/products/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur mise a jour')
  return response.json()
}

export async function deleteProduct(id) {
  const response = await fetch(`/api/seller/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!response.ok) throw new Error('Erreur suppression')
  return true
}

export async function getSellerShop() {
  const response = await fetch('/api/seller/shop', { headers: authHeaders() })
  if (!response.ok) return null
  return response.json()
}

export async function createShop(data) {
  const response = await fetch('/api/seller/shop', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur boutique')
  return response.json()
}

export async function getAdminCategories() {
  const response = await fetch('/api/admin/categories', { headers: authHeaders() })
  if (!response.ok) throw new Error('Erreur categories')
  return response.json()
}

export async function createCategory(data) {
  const response = await fetch('/api/admin/categories', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur creation')
  return response.json()
}

export async function updateCategory(id, data) {
  const response = await fetch(`/api/admin/categories/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur mise a jour')
  return response.json()
}

export async function deleteCategory(id) {
  const response = await fetch(`/api/admin/categories/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Erreur suppression')
  }
  return true
}

export async function getPages() {
  const response = await fetch('/api/pages')
  if (!response.ok) throw new Error('Impossible de charger les pages')
  return response.json()
}

export async function cancelOrder(id) {
  const response = await fetch(`/api/orders/${id}/cancel`, {
    method: 'POST',
    headers: authHeaders(),
  })
  if (!response.ok) throw new Error('Impossible d’annuler la commande')
  return response.json()
}

export async function submitReview(data) {
  const response = await fetch('/api/reviews', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Impossible de soumettre l’avis')
  }
  return response.json()
}

export async function getSellerOrders() {
  const response = await fetch('/api/seller/orders', { headers: authHeaders() })
  if (!response.ok) throw new Error('Impossible de charger les commandes vendeur')
  const payload = await response.json()
  return payload.data ?? payload
}

export async function getSellerOrder(id) {
  const response = await fetch(`/api/seller/orders/${id}`, { headers: authHeaders() })
  if (!response.ok) throw new Error('Commande vendeur introuvable')
  return response.json()
}

export async function updateOrderStatus(id, status) {
  const response = await fetch(`/api/seller/orders/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Impossible de mettre à jour le statut')
  }
  return response.json()
}

export async function getSellerDashboard() {
  const response = await fetch('/api/seller/dashboard', { headers: authHeaders() })
  if (!response.ok) throw new Error('Impossible de charger le tableau de bord vendeur')
  return response.json()
}

export async function getAdminDashboard() {
  const response = await fetch('/api/admin/dashboard', { headers: authHeaders() })
  if (!response.ok) throw new Error('Impossible de charger le tableau de bord admin')
  return response.json()
}

export async function getPendingShops() {
  const response = await fetch('/api/admin/shops/pending', { headers: authHeaders() })
  if (!response.ok) throw new Error('Impossible de charger les boutiques en attente')
  const payload = await response.json()
  return payload.data ?? payload
}

export async function approveShop(id) {
  const response = await fetch(`/api/admin/shops/${id}/approve`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  if (!response.ok) throw new Error('Impossible d’approuver la boutique')
  return response.json()
}

export async function suspendShop(id) {
  const response = await fetch(`/api/admin/shops/${id}/suspend`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  if (!response.ok) throw new Error('Impossible de suspendre la boutique')
  return response.json()
}

export async function getAdminReviews() {
  const response = await fetch('/api/admin/reviews', { headers: authHeaders() })
  if (!response.ok) throw new Error('Impossible de charger les avis')
  const payload = await response.json()
  return payload.data ?? payload
}

export async function deleteReview(id) {
  const response = await fetch(`/api/admin/reviews/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!response.ok) throw new Error('Impossible de supprimer l’avis')
  return true
}

export async function getPage(slug) {
  const response = await fetch(`/api/pages/${slug}`)
  if (!response.ok) return response.status === 404 ? null : (function(){throw new Error('Erreur')})()
  return response.json()
}

export async function getCategories() {
  const response = await fetch('/api/categories')
  if (!response.ok) throw new Error('Impossible de charger les categories')
  return response.json()
}

export async function getProducts() {
  const response = await fetch('/api/products')
  if (!response.ok) throw new Error('Impossible de charger les produits')
  const payload = await response.json()
  return payload.data ?? payload
}

export async function getProduct(slug) {
  const response = await fetch(`/api/products/${slug}`)
  if (!response.ok) throw new Error('Produit introuvable')
  return response.json()
}

export async function getShop(slug) {
  const response = await fetch(`/api/shops/${slug}`)
  if (!response.ok) throw new Error('Boutique introuvable')
  return response.json()
}

export async function login(credentials) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(credentials),
  })
  if (!response.ok) throw new Error('Connexion impossible')
  return response.json()
}

export async function register(data) {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Inscription impossible')
  return response.json()
}

export async function getCart() {
  const response = await fetch('/api/cart', { headers: authHeaders() })
  if (!response.ok) throw new Error('Impossible de charger le panier')
  return response.json()
}

export async function addCartItem(productId, quantity = 1) {
  const response = await fetch('/api/cart/items', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ product_id: productId, quantity }),
  })
  if (!response.ok) throw new Error('Impossible d’ajouter au panier')
  return response.json()
}

export async function updateCartItem(itemId, quantity) {
  const response = await fetch(`/api/cart/items/${itemId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ quantity }),
  })
  if (!response.ok) throw new Error('Impossible de modifier le panier')
  return response.json()
}

export async function removeCartItem(itemId) {
  const response = await fetch(`/api/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!response.ok) throw new Error('Impossible de supprimer l’article')
  return response.json()
}

export async function checkout(data) {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Impossible de finaliser la commande')
  return response.json()
}

export async function getOrders() {
  const response = await fetch('/api/orders', { headers: authHeaders() })
  if (!response.ok) throw new Error('Impossible de charger les commandes')
  const payload = await response.json()
  return payload.data ?? payload
}

export async function getOrder(id) {
  const response = await fetch(`/api/orders/${id}`, { headers: authHeaders() })
  if (!response.ok) throw new Error('Commande introuvable')
  return response.json()
}
