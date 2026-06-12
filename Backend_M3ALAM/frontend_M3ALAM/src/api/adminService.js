import { apiRequest, unwrapData } from './api'

export function getAdminDashboard(range = 'day') {
  const params = range ? `?range=${encodeURIComponent(range)}` : ''
  return apiRequest(`/admin/dashboard${params}`)
}

export function getAdminCategories() {
  return apiRequest('/admin/categories')
}

export function getAdminUsers() {
  return apiRequest('/admin/users')
}

export function createAdminUser(payload) {
  return apiRequest('/admin/users', {
    method: 'POST',
    body: payload,
  })
}

export function approveAdminUser(id) {
  return apiRequest(`/admin/users/${id}/approve`, {
    method: 'PATCH',
  })
}

export function createCategory(payload) {
  return apiRequest('/admin/categories', {
    method: 'POST',
    body: payload,
  })
}

export function updateCategory(id, payload) {
  return apiRequest(`/admin/categories/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export function deleteCategory(id) {
  return apiRequest(`/admin/categories/${id}`, {
    method: 'DELETE',
  })
}

export async function getPendingShops() {
  const payload = await apiRequest('/admin/shops/pending')
  return unwrapData(payload)
}

export async function getAdminReviews() {
  const payload = await apiRequest('/admin/reviews')
  return unwrapData(payload)
}

export function deleteAdminReview(id) {
  return apiRequest(`/admin/reviews/${id}`, {
    method: 'DELETE',
  })
}

export async function getAdminOrders() {
  const payload = await apiRequest('/admin/orders')
  return unwrapData(payload)
}

export function approveShop(id) {
  return apiRequest(`/admin/shops/${id}/approve`, {
    method: 'PATCH',
  })
}

export function suspendShop(id) {
  return apiRequest(`/admin/shops/${id}/suspend`, {
    method: 'PATCH',
  })
}
