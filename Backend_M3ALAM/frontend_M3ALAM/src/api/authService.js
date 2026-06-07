import { apiRequest, clearAuthToken, setAuthToken } from './api'

export async function login(credentials, remember = true) {
  const data = await apiRequest('/login', {
    method: 'POST',
    body: credentials,
  })

  if (data?.token) setAuthToken(data.token, remember)
  return data
}

export async function register(payload) {
  const data = await apiRequest('/register', {
    method: 'POST',
    body: payload,
  })

  if (data?.token) setAuthToken(data.token)
  return data
}

export function logoutLocal() {
  clearAuthToken()
}

export function getProfile() {
  return apiRequest('/user')
}

export function updateProfile(payload) {
  return apiRequest('/user', {
    method: 'PUT',
    body: payload,
  })
}

export async function logout() {
  const data = await apiRequest('/logout', { method: 'POST' })
  logoutLocal()
  return data
}
