export interface ShareLink {
  token: string
  shareUrl: string
  expiresAt: string
  hasPassword: boolean
  accessCount: number
  createdAt?: string
}

export interface FileItem {
  id: number
  name: string
  customName: string | null
  key: string
  mime: string
  size: number
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  downloadUrl?: string // Only present in GET /files/:id
  shareLinks?: ShareLink[] // Share links for this file
}

export interface PaginationMetadata {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface FilesListResponse {
  files: FileItem[]
  pagination?: PaginationMetadata
}

export interface FileFilters {
  search?: string
  mime?: string
  minSize?: number
  maxSize?: number
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface UploadFilePayload {
  file: File
  customName?: string
  metadata?: Record<string, unknown>
}

export interface HealthCheckResponse {
  status: string
  timestamp: string
}

export interface ErrorResponse {
  error: string | object
}

// Share Link API Types
export interface CreateShareLinkRequest {
  ttl?: string // Time-to-live in seconds as string (default: 7 days)
  password?: string // Optional password protection
}

export interface CreateShareLinkResponse {
  shareUrl: string
  token: string
  expiresAt: string
  hasPassword: boolean
  ttl: number
}

export interface ShareLinksListResponse {
  shares: ShareLink[]
}

// Public Shared File Access Types
export interface SharedFileAccessResponse {
  file: {
    id: number
    name: string
    customName: string | null
    mime: string
    size: number
    createdAt: string
  }
  downloadUrl: string
  expiresAt: string
  accessCount: number
}

export interface SharedFileErrorResponse {
  error: string
  requiresPassword?: boolean
}
