import { apiRequest, unwrapData } from './api'

export function getSellerDashboard() {
  return apiRequest('/seller/dashboard')
}

export function submitSellerVerificationDocuments(payload) {
  return apiRequest('/seller/shop/verification-documents', {
    method: 'POST',
    body: payload,
  })
}

export function getSellerShop() {
  return apiRequest('/seller/shop')
}

export function createShop(payload) {
  return apiRequest('/seller/shop', {
    method: 'POST',
    body: payload,
  })
}

export async function getSellerProducts() {
  const payload = await apiRequest('/seller/products')
  return unwrapData(payload)
}

export async function getSellerProductById(id) {
  return apiRequest(`/seller/products/${id}`)
}

export function createProduct(payload) {
  return apiRequest('/seller/products', {
    method: 'POST',
    body: payload,
  })
}

export function updateProduct(id, payload) {
  return apiRequest(`/seller/products/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export function deleteProduct(id) {
  return apiRequest(`/seller/products/${id}`, {
    method: 'DELETE',
  })
}

export async function getSellerOrders(page = 1) {
  return apiRequest(`/seller/orders?page=${page}&per_page=5`)
}

export function getSellerOrder(id) {
  return apiRequest(`/seller/orders/${id}`).then(unwrapData)
}

export function updateOrderStatus(id, status) {
  return apiRequest(`/seller/orders/${id}/status`, {
    method: 'PATCH',
    body: { status },
  })
}

export function contactSellerOrder(id, payload) {
  return apiRequest(`/seller/orders/${id}/contact`, {
    method: 'POST',
    body: payload,
  })
}

export async function getSellerMessages() {
  const payload = await apiRequest('/seller/messages')
  return unwrapData(payload)
}

export async function getCategories() {
  const payload = await apiRequest('/categories')
  return unwrapData(payload)
}
