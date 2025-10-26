export async function login(username: string, password: string): Promise<boolean> {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (data.success) {
      localStorage.setItem('authenticated', 'true')
      return true
    }

    return false
  } catch (error) {
    console.error('Login error:', error)
    return false
  }
}

export function logout(): void {
  localStorage.removeItem('authenticated')
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return localStorage.getItem('authenticated') === 'true'
}
