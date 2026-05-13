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
