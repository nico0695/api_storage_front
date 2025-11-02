'use client'

import { Download, Trash2, Link2, Copy, Share2, MoreVertical } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { FileItem } from '@/lib/types'
import { ShareDialog } from './share-dialog'
import { ShareLinkDialog } from './share-link-dialog'

interface FileActionsMenuProps {
  file: FileItem
  onDownload: () => void
  onDelete: () => void
  onCopyShareLink?: () => void
  onViewShareLinks?: () => void
  onShareSuccess?: () => void
}

export function FileActionsMenu({
  file,
  onDownload,
  onDelete,
  onCopyShareLink,
  onViewShareLinks,
  onShareSuccess,
}: FileActionsMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const hasShareLinks = file.shareLinks && file.shareLinks.length > 0
  const shareUrl = hasShareLinks ? `${window.location.origin}/share/${file.shareLinks![0].token}` : ''

  const handleAction = (action: () => void) => {
    action()
    setMenuOpen(false)
  }

  return (
    <>
      {/* Botón de menú para móvil - Touch target de 44x44px */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMenuOpen(true)}
        className="h-11 w-11 md:hidden"
        aria-label={`Acciones para ${file.customName || file.name}`}
        title="Más acciones"
      >
        <MoreVertical className="h-5 w-5" />
      </Button>

      {/* Dialog con el menú de acciones */}
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Acciones</DialogTitle>
            <DialogDescription className="text-sm line-clamp-2">
              {file.customName || file.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 py-2">
            {/* Download */}
            <Button
              variant="ghost"
              className="justify-start h-12 text-base"
              onClick={() => handleAction(onDownload)}
            >
              <Download className="h-5 w-5 mr-3" />
              Descargar
            </Button>

            {/* Share Links Section */}
            {hasShareLinks ? (
              <>
                {/* Share via native dialog */}
                <ShareDialog
                  fileName={file.customName || file.name}
                  shareUrl={shareUrl}
                  trigger={
                    <Button
                      variant="ghost"
                      className="justify-start h-12 text-base w-full"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Share2 className="h-5 w-5 mr-3" />
                      Compartir archivo
                    </Button>
                  }
                />

                {/* Copy share link */}
                {onCopyShareLink && (
                  <Button
                    variant="ghost"
                    className="justify-start h-12 text-base"
                    onClick={() => handleAction(onCopyShareLink)}
                  >
                    <Copy className="h-5 w-5 mr-3" />
                    Copiar enlace
                  </Button>
                )}

                {/* View all share links */}
                {onViewShareLinks && (
                  <Button
                    variant="ghost"
                    className="justify-start h-12 text-base"
                    onClick={() => handleAction(onViewShareLinks)}
                  >
                    <Link2 className="h-5 w-5 mr-3" />
                    Ver enlaces ({file.shareLinks!.length})
                  </Button>
                )}
              </>
            ) : (
              /* Create share link */
              <ShareLinkDialog
                fileId={file.id}
                fileName={file.customName || file.name}
                onSuccess={() => {
                  onShareSuccess?.()
                  setMenuOpen(false)
                }}
                trigger={
                  <Button
                    variant="ghost"
                    className="justify-start h-12 text-base w-full"
                  >
                    <Link2 className="h-5 w-5 mr-3" />
                    Crear enlace para compartir
                  </Button>
                }
              />
            )}

            {/* Delete */}
            <Button
              variant="ghost"
              className="justify-start h-12 text-base text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => handleAction(onDelete)}
            >
              <Trash2 className="h-5 w-5 mr-3" />
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
