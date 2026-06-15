import { apiRequest, unwrapData } from './api'

export async function getClientMessages() {
  const payload = await apiRequest('/messages')
  return unwrapData(payload)
}

export function markClientMessageRead(threadKey) {
  return apiRequest('/messages/read', {
    method: 'PATCH',
    body: { thread_key: threadKey },
  })
}

export function replyClientMessage(payload) {
  return apiRequest('/messages/reply', {
    method: 'POST',
    body: payload,
  })
}
