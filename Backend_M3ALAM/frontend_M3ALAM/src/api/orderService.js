import { apiRequest } from './api'

export function checkout(payload) {
  return apiRequest('/checkout', {
    method: 'POST',
    body: payload,
  })
}

export async function getOrders(page = 1) {
  return apiRequest(`/orders?page=${page}`)
}

export function getOrder(id) {
  return apiRequest(`/orders/${id}`)
}

export function cancelOrder(id) {
  return apiRequest(`/orders/${id}/cancel`, {
    method: 'POST',
  })
}
