'use client'

import { Upload, Plus, Camera, FolderOpen } from 'lucide-react'
import { useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { MetadataJsonField } from '@/components/json-metadata-field'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadFile } from '@/lib/api'
import { useIsMobile } from '@/hooks/useMediaQuery'
import type { UploadFilePayload } from '@/lib/types'
import type { MetadataStatus } from '@/lib/json-metadata'

interface UploadDialogProps {
  onUploadSuccess?: () => void
}

export function UploadDialog({ onUploadSuccess }: UploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [customName, setCustomName] = useState('')
  const [metadata, setMetadata] = useState('')
  const [metadataStatus, setMetadataStatus] = useState<MetadataStatus>('idle')
  const [uploading, setUploading] = useState(false)
  const isMobile = useIsMobile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0])
      }
    },
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleCameraClick = () => {
    cameraInputRef.current?.click()
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)

    try {
      const payload: UploadFilePayload = {
        file: selectedFile,
      }

      if (customName.trim()) {
        payload.customName = customName.trim()
      }

      if (metadata.trim()) {
        try {
          payload.metadata = JSON.parse(metadata)
        } catch (_error) {
          toast.error('Invalid JSON metadata')
          setUploading(false)
          setMetadataStatus('invalid')
          return
        }
      }

      await uploadFile(payload)
      toast.success('File uploaded successfully')

      // Reset form
      setSelectedFile(null)
      setCustomName('')
      setMetadata('')
      setMetadataStatus('idle')
      setOpen(false)

      onUploadSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add File
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[600px] w-[100vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subir archivo</DialogTitle>
          <DialogDescription>
            Sube un archivo a tu almacenamiento Backblaze B2
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Drag & Drop Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25'
            }`}
            role="region"
            aria-label="Área de carga de archivos"
            aria-describedby="upload-dialog-description"
          >
            <input {...getInputProps()} aria-hidden="true" tabIndex={-1} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />

            {selectedFile ? (
              <div role="status" aria-live="polite">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div id="upload-dialog-description">
                <p className="font-medium mb-2">
                  {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra y suelta un archivo aquí'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  o usa los botones de abajo para seleccionar
                </p>
              </div>
            )}

            {/* File Selection Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="sr-only"
                id="dialog-file-input"
                aria-label="Seleccionar archivo desde dispositivo"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*,video/*"
                capture="environment"
                onChange={handleFileSelect}
                className="sr-only"
                id="dialog-camera-input"
                aria-label="Tomar foto o video con la cámara"
              />

              {/* Browse Files Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleBrowseClick}
                className="h-11 px-6 text-base"
                aria-label="Seleccionar archivo desde dispositivo"
              >
                <FolderOpen className="h-5 w-5 mr-2" />
                Seleccionar archivo
              </Button>

              {/* Camera Button - Only on mobile */}
              {isMobile && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCameraClick}
                  className="h-11 px-6 text-base"
                  aria-label="Tomar foto o video con la cámara"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Usar cámara
                </Button>
              )}
            </div>
          </div>

          {/* Upload Status - Live Region */}
          {uploading && (
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="text-center text-sm text-muted-foreground"
            >
              Subiendo archivo...
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="dialog-customName">Nombre personalizado (opcional)</Label>
            <Input
              id="dialog-customName"
              placeholder="Mi Archivo Personalizado"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              maxLength={255}
              aria-describedby="dialog-customName-help"
            />
            <p id="dialog-customName-help" className="text-xs text-muted-foreground">
              Dale un nombre personalizado a tu archivo
            </p>
          </div>

          <MetadataJsonField
            value={metadata}
            status={metadataStatus}
            onChange={setMetadata}
            onStatusChange={setMetadataStatus}
            id="upload-dialog-metadata"
          />

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full h-11 text-base"
            aria-label={uploading ? 'Subiendo archivo' : 'Subir archivo'}
          >
            {uploading ? 'Subiendo...' : 'Subir archivo'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
