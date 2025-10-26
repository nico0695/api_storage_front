export function login(username: string, password: string): boolean {
  // Check credentials from environment variables
  const validUsername = process.env.NEXT_PUBLIC_AUTH_USERNAME || "admin"
  const validPassword = process.env.NEXT_PUBLIC_AUTH_PASSWORD || "admin123"

  if (username === validUsername && password === validPassword) {
    localStorage.setItem("authenticated", "true")
    return true
  }

  return false
}

export function logout(): void {
  localStorage.removeItem("authenticated")
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("authenticated") === "true"
}
