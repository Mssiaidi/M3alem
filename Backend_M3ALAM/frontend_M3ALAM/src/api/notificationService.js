import { apiRequest } from './api'

export function getNotifications() {
  return apiRequest('/notifications')
}

export function markNotificationRead(id) {
  return apiRequest(`/notifications/${id}/read`, {
    method: 'PATCH',
  })
}

export function markAllNotificationsRead() {
  return apiRequest('/notifications/read-all', {
    method: 'PATCH',
  })
}
