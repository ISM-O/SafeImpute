const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

async function postJson(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.message || response.statusText || 'Erreur serveur')
  }

  return data
}

export async function registerUser(payload) {
  return postJson('/register', payload)
}

export async function loginUser(payload) {
  return postJson('/login', payload)
}
