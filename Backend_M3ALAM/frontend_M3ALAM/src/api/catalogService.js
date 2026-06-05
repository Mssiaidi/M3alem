import { apiRequest, unwrapData } from './api'

export async function getCategories() {
  return apiRequest('/categories')
}

export async function getProducts() {
  const payload = await apiRequest('/products')
  return unwrapData(payload)
}

export function getProduct(slug) {
  return apiRequest(`/products/${slug}`)
}

export function getShop(slug) {
  return apiRequest(`/shops/${slug}`)
}
