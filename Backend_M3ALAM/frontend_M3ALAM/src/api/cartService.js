import { apiRequest } from './api'

export function getCart() {
  return apiRequest('/cart')
}

export function addCartItem(productId, quantity = 1) {
  return apiRequest('/cart/items', {
    method: 'POST',
    body: {
      product_id: productId,
      quantity,
    },
  })
}

export function updateCartItem(itemId, quantity) {
  return apiRequest(`/cart/items/${itemId}`, {
    method: 'PUT',
    body: { quantity },
  })
}

export function removeCartItem(itemId) {
  return apiRequest(`/cart/items/${itemId}`, {
    method: 'DELETE',
  })
}
