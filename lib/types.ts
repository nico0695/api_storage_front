export interface FileItem {
  id: number;
  name: string;
  customName: string | null;
  key: string;
  mime: string;
  size: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  downloadUrl?: string; // Only present in GET /files/:id
}

export interface FilesListResponse {
  files: FileItem[];
}

export interface UploadFilePayload {
  file: File;
  customName?: string;
  metadata?: Record<string, unknown>;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
}

export interface ErrorResponse {
  error: string | object;
}
