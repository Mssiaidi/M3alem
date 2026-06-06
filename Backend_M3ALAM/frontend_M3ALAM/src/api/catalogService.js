import { apiRequest, unwrapData } from './api'

export async function getCategories() {
  return apiRequest('/categories')
}

function buildQuery(params = {}) {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value)
    }
  })

  const query = search.toString()
  return query ? `?${query}` : ''
}

export async function getProducts(params = {}) {
  const payload = await apiRequest(`/products${buildQuery(params)}`)
  return unwrapData(payload)
}

export function getProductsPage(params = {}) {
  return apiRequest(`/products${buildQuery(params)}`)
}

export function getProduct(slug) {
  return apiRequest(`/products/${slug}`)
}

export function getShop(slug) {
  return apiRequest(`/shops/${slug}`)
}
