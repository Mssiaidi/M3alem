export async function getPages() {
  const response = await fetch('/api/pages')

  if (!response.ok) {
    throw new Error('Impossible de charger les pages')
  }

  return response.json()
}

export async function getPage(slug) {
  const response = await fetch(`/api/pages/${slug}`)

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }

    throw new Error('Impossible de charger la page')
  }

  return response.json()
}

export async function getCategories() {
  const response = await fetch('/api/categories')

  if (!response.ok) {
    throw new Error('Impossible de charger les categories')
  }

  return response.json()
}

export async function getProducts() {
  const response = await fetch('/api/products')

  if (!response.ok) {
    throw new Error('Impossible de charger les produits')
  }

  const payload = await response.json()

  return payload.data ?? payload
}

export async function getProduct(slug) {
  const response = await fetch(`/api/products/${slug}`)

  if (!response.ok) {
    throw new Error('Produit introuvable')
  }

  return response.json()
}

export async function getShop(slug) {
  const response = await fetch(`/api/shops/${slug}`)

  if (!response.ok) {
    throw new Error('Boutique introuvable')
  }

  return response.json()
}

function authHeaders() {
  const token = localStorage.getItem('m3alem_token')

  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function login(credentials) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    throw new Error('Connexion impossible')
  }

  return response.json()
}

export async function register(data) {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Inscription impossible')
  }

  return response.json()
}

export async function getCart() {
  const response = await fetch('/api/cart', {
    headers: authHeaders(),
  })

  if (!response.ok) {
    throw new Error('Impossible de charger le panier')
  }

  return response.json()
}

export async function addCartItem(productId, quantity = 1) {
  const response = await fetch('/api/cart/items', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ product_id: productId, quantity }),
  })

  if (!response.ok) {
    throw new Error('Impossible d’ajouter au panier')
  }

  return response.json()
}

export async function updateCartItem(itemId, quantity) {
  const response = await fetch(`/api/cart/items/${itemId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ quantity }),
  })

  if (!response.ok) {
    throw new Error('Impossible de modifier le panier')
  }

  return response.json()
}

export async function removeCartItem(itemId) {
  const response = await fetch(`/api/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })

  if (!response.ok) {
    throw new Error('Impossible de supprimer l’article')
  }

  return response.json()
}

export async function checkout(data) {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Impossible de finaliser la commande')
  }

  return response.json()
}

export async function getOrders() {
  const response = await fetch('/api/orders', {
    headers: authHeaders(),
  })

  if (!response.ok) {
    throw new Error('Impossible de charger les commandes')
  }

  const payload = await response.json()

  return payload.data ?? payload
}

export async function getOrder(id) {
  const response = await fetch(`/api/orders/${id}`, {
    headers: authHeaders(),
  })

  if (!response.ok) {
    throw new Error('Commande introuvable')
  }

  return response.json()
}
