import { apiRequest, unwrapData } from './api'

export function getAdminDashboard() {
  return apiRequest('/admin/dashboard')
}

export function getAdminCategories() {
  return apiRequest('/admin/categories')
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
