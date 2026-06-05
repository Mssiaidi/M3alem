import { apiRequest, unwrapData } from './api'

export function checkout(payload) {
  return apiRequest('/checkout', {
    method: 'POST',
    body: payload,
  })
}

export async function getOrders() {
  const payload = await apiRequest('/orders')
  return unwrapData(payload)
}

export function getOrder(id) {
  return apiRequest(`/orders/${id}`)
}

export function cancelOrder(id) {
  return apiRequest(`/orders/${id}/cancel`, {
    method: 'POST',
  })
}
