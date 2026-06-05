import { apiRequest } from './api'

export function getPages() {
  return apiRequest('/pages')
}

export function getPage(slug) {
  return apiRequest(`/pages/${slug}`)
}
