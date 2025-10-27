import type {
  FileItem,
  FilesListResponse,
  UploadFilePayload,
  HealthCheckResponse,
  FileFilters,
  CreateShareLinkRequest,
  CreateShareLinkResponse,
  ShareLinksListResponse,
  SharedFileAccessResponse,
  SharedFileErrorResponse,
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'X-API-Key': API_KEY,
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'API request failed' }))

    // Handle validation errors (array of error objects)
    if (Array.isArray(error.error)) {
      const validationErrors = error.error
        .map((err: { message?: string; path?: string[] }) =>
          err.path ? `${err.path.join('.')}: ${err.message}` : err.message
        )
        .join(', ')
      throw new Error(validationErrors || 'Validation error')
    }

    throw new Error(error.error || 'API request failed')
  }

  return response.json()
}

export async function uploadFile(payload: UploadFilePayload): Promise<FileItem> {
  const formData = new FormData()
  formData.append('file', payload.file)

  if (payload.customName) {
    formData.append('customName', payload.customName)
  }

  if (payload.metadata) {
    formData.append('metadata', JSON.stringify(payload.metadata))
  }

  return fetchAPI<FileItem>('/files/upload', {
    method: 'POST',
    body: formData,
  })
}

export async function listFiles(filters?: FileFilters): Promise<FilesListResponse> {
  let url = '/files'

  if (filters) {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, String(value))
      }
    })

    const queryString = params.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  return fetchAPI<FilesListResponse>(url)
}

export async function getFileDetails(id: number): Promise<FileItem> {
  return fetchAPI<FileItem>(`/files/${id}`)
}

export async function deleteFile(id: number): Promise<{ message: string }> {
  return fetchAPI(`/files/${id}`, {
    method: 'DELETE',
  })
}

export async function healthCheck(): Promise<HealthCheckResponse> {
  const response = await fetch(`${API_URL}/health`)
  return response.json()
}

// Share Link API Functions

export async function createShareLink(
  fileId: number,
  request: CreateShareLinkRequest = {}
): Promise<CreateShareLinkResponse> {
  return fetchAPI<CreateShareLinkResponse>(`/files/${fileId}/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })
}

export async function listShareLinks(fileId: number): Promise<ShareLinksListResponse> {
  return fetchAPI<ShareLinksListResponse>(`/files/${fileId}/shares`)
}

export async function revokeShareLink(token: string): Promise<{ message: string }> {
  return fetchAPI(`/share/${token}`, {
    method: 'DELETE',
  })
}

// Public endpoint - no API key required
export async function accessSharedFile(
  token: string,
  password?: string
): Promise<SharedFileAccessResponse> {
  const url = password
    ? `${API_URL}/share/${token}?password=${encodeURIComponent(password)}`
    : `${API_URL}/share/${token}`

  const response = await fetch(url)

  if (!response.ok) {
    const error: SharedFileErrorResponse = await response
      .json()
      .catch(() => ({ error: 'Failed to access shared file' }))
    throw error
  }

  return response.json()
}
