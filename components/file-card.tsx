'use client'

import { FileIcon, Image, Video, FileText, Link2, Download, Trash2, Copy, Share2, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { FileItem } from '@/lib/types'
import { formatFileSize, formatDate } from '@/lib/utils'
import { FileActionsMenu } from './file-actions-menu'
import { ShareDialog } from './share-dialog'
import { ShareLinkDialog } from './share-link-dialog'

interface FileCardProps {
  file: FileItem
  onDownload: (id: number) => void
  onDelete: (file: FileItem) => void
  onCopyShareLink: (token: string) => void
  onViewShareLinks: (file: FileItem) => void
  onShareSuccess: () => void
}

export function FileCard({
  file,
  onDownload,
  onDelete,
  onCopyShareLink,
  onViewShareLinks,
  onShareSuccess,
}: FileCardProps) {
  const hasShareLinks = file.shareLinks && file.shareLinks.length > 0

  const getMimeIcon = (mime: string) => {
    if (mime.startsWith('image/')) {
      return <Image className="h-5 w-5" />
    }
    if (mime.startsWith('video/')) {
      return <Video className="h-5 w-5" />
    }
    if (mime.startsWith('text/') || mime === 'application/pdf') {
      return <FileText className="h-5 w-5" />
    }
    return <FileIcon className="h-5 w-5" />
  }

  const getMimeLabel = (mime: string): string => {
    if (mime.startsWith('image/')) {
      return mime.replace('image/', '').toUpperCase()
    }
    if (mime.startsWith('video/')) {
      return mime.replace('video/', '').toUpperCase()
    }
    if (mime === 'application/pdf') {
      return 'PDF'
    }
    if (mime.startsWith('text/')) {
      return 'Texto'
    }
    return mime.split('/')[1]?.toUpperCase() || 'Archivo'
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="shrink-0 mt-1">
            {getMimeIcon(file.mime)}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            {/* File Name */}
            <h3 className="font-medium text-base leading-tight mb-1 break-words">
              {file.customName || file.name}
            </h3>

            {/* Path display */}
            {file.path && (
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Folder className="h-3 w-3" />
                <span>{file.path}</span>
              </p>
            )}

            {/* Original name if custom name exists */}
            {file.customName && (
              <p className="text-xs text-muted-foreground mb-2 truncate">
                {file.name}
              </p>
            )}

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-3">
              <span className="font-medium">{getMimeLabel(file.mime)}</span>
              <span>•</span>
              <span>{formatFileSize(file.size)}</span>
              <span>•</span>
              <span>{formatDate(file.createdAt)}</span>
            </div>

            {/* Share Links Indicator */}
            {hasShareLinks && (
              <button
                onClick={() => onViewShareLinks(file)}
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-3"
                aria-label={`Ver ${file.shareLinks!.length} enlaces compartidos`}
              >
                <Link2 className="h-3.5 w-3.5" />
                <span>
                  {file.shareLinks!.length} {file.shareLinks!.length === 1 ? 'enlace' : 'enlaces'} compartido{file.shareLinks!.length === 1 ? '' : 's'}
                </span>
              </button>
            )}

            {/* Actions - Desktop version (hidden on mobile) */}
            <div className="hidden md:flex gap-2 mt-2">
              {hasShareLinks && (
                <ShareDialog
                  fileName={file.customName || file.name}
                  shareUrl={`${window.location.origin}/share/${file.shareLinks![0].token}`}
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      title="Compartir archivo"
                    >
                      <Share2 className="h-4 w-4 mr-1.5" />
                      Compartir
                    </Button>
                  }
                />
              )}

              {hasShareLinks ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => onCopyShareLink(file.shareLinks![0].token)}
                  title="Copiar enlace"
                >
                  <Copy className="h-4 w-4 mr-1.5" />
                  Copiar
                </Button>
              ) : (
                <ShareLinkDialog
                  fileId={file.id}
                  fileName={file.customName || file.name}
                  onSuccess={onShareSuccess}
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      title="Crear enlace"
                    >
                      <Link2 className="h-4 w-4 mr-1.5" />
                      Crear enlace
                    </Button>
                  }
                />
              )}

              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => onDownload(file.id)}
                title="Descargar"
              >
                <Download className="h-4 w-4 mr-1.5" />
                Descargar
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-9 text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(file)}
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Eliminar
              </Button>
            </div>
          </div>

          {/* Mobile Menu (visible on mobile only) */}
          <div className="shrink-0 md:hidden">
            <FileActionsMenu
              file={file}
              onDownload={() => onDownload(file.id)}
              onDelete={() => onDelete(file)}
              onCopyShareLink={hasShareLinks ? () => onCopyShareLink(file.shareLinks![0].token) : undefined}
              onViewShareLinks={hasShareLinks ? () => onViewShareLinks(file) : undefined}
              onShareSuccess={onShareSuccess}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
