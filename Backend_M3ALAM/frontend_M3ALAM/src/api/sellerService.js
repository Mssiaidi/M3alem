import { apiRequest, unwrapData } from './api'

export function getSellerDashboard() {
  return apiRequest('/seller/dashboard')
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
  const products = await getSellerProducts()
  return products.find((product) => product.id === Number(id))
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

export async function getSellerOrders() {
  const payload = await apiRequest('/seller/orders')
  return unwrapData(payload)
}

export function getSellerOrder(id) {
  return apiRequest(`/seller/orders/${id}`)
}

export function updateOrderStatus(id, status) {
  return apiRequest(`/seller/orders/${id}/status`, {
    method: 'PATCH',
    body: { status },
  })
}
