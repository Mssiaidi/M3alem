import { apiRequest, clearAuthToken, setAuthToken } from './api'

const USER_KEY = 'm3alem_user'

export function setAuthUser(user) {
  sessionStorage.removeItem(USER_KEY)
  localStorage.removeItem(USER_KEY)
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

export function getAuthUser() {
  const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY)

  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearAuthUser() {
  sessionStorage.removeItem(USER_KEY)
  localStorage.removeItem(USER_KEY)
}

export async function login(credentials, remember = true) {
  const data = await apiRequest('/login', {
    method: 'POST',
    body: credentials,
  })

  if (data?.token) setAuthToken(data.token, remember)
  if (data?.user) setAuthUser(data.user)
  return data
}

export async function register(payload) {
  const data = await apiRequest('/register', {
    method: 'POST',
    body: payload,
  })

  if (data?.token) setAuthToken(data.token)
  if (data?.user) setAuthUser(data.user)
  return data
}

export function logoutLocal() {
  clearAuthToken()
  clearAuthUser()
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
