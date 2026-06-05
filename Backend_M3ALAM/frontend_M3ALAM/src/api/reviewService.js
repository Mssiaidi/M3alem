import { apiRequest, unwrapData } from './api'

export function submitReview(payload) {
  return apiRequest('/reviews', {
    method: 'POST',
    body: payload,
  })
}

export async function getAdminReviews() {
  const payload = await apiRequest('/admin/reviews')
  return unwrapData(payload)
}

export function deleteReview(id) {
  return apiRequest(`/admin/reviews/${id}`, {
    method: 'DELETE',
  })
}
