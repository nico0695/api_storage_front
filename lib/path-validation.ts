export type PathStatus = 'idle' | 'valid' | 'invalid'

export interface PathValidationResult {
  status: PathStatus
  error?: string
  normalized?: string
}

/**
 * Validates a file path according to backend rules:
 * - Allowed: a-z, A-Z, 0-9, /, _, -
 * - Forbidden: .. (traversal), // (consecutive slashes)
 * - Auto-normalized: leading/trailing slashes removed
 */
export function validatePath(path: string): PathValidationResult {
  // Empty paths are valid (root level)
  if (!path || !path.trim()) {
    return { status: 'idle', normalized: '' }
  }

  // Normalize: remove leading/trailing slashes
  const normalized = path.trim().replace(/^\/+|\/+$/g, '')

  if (!normalized) {
    return { status: 'idle', normalized: '' }
  }

  // Check for path traversal
  if (normalized.includes('..')) {
    return {
      status: 'invalid',
      error: 'Path cannot contain ".." (path traversal)',
    }
  }

  // Check for consecutive slashes
  if (normalized.includes('//')) {
    return {
      status: 'invalid',
      error: 'Path cannot contain consecutive slashes',
    }
  }

  // Check allowed characters only
  const validPattern = /^[a-zA-Z0-9/_-]+$/
  if (!validPattern.test(normalized)) {
    return {
      status: 'invalid',
      error: 'Path contains invalid characters. Allowed: a-z, A-Z, 0-9, /, _, -',
    }
  }

  return { status: 'valid', normalized }
}

/**
 * Normalizes a path without validation
 */
export function normalizePath(path: string): string {
  if (!path || !path.trim()) return ''
  return path.trim().replace(/^\/+|\/+$/g, '')
}
