const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'm3alem_token'

export function getAuthToken() {
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token, remember = true) {
  sessionStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_KEY)

  if (token) {
    const storage = remember ? localStorage : sessionStorage
    storage.setItem(TOKEN_KEY, token)
  }
}

export function clearAuthToken() {
  sessionStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_KEY)
}

function buildHeaders(headers = {}, skipContentType = false) {
  const token = getAuthToken()

  return {
    Accept: 'application/json',
    ...(skipContentType ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    throw new Error(data?.message || 'Erreur API')
  }

  return data
}

export async function apiRequest(endpoint, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: buildHeaders(options.headers, isFormData),
    body: options.body
      ? isFormData
        ? options.body
        : JSON.stringify(options.body)
      : undefined,
  })

  return parseResponse(response)
}

export function unwrapData(payload) {
  return payload?.data ?? payload
}
