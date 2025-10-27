'use client'

import { Link2, Copy, Check, Trash2, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { revokeShareLink } from '@/lib/api'
import type { ShareLink } from '@/lib/types'

interface ShareLinksDisplayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName: string
  shareLinks: ShareLink[]
  onRevoke?: () => void
}

export function ShareLinksDisplay({
  open,
  onOpenChange,
  fileName,
  shareLinks,
  onRevoke,
}: ShareLinksDisplayProps) {
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [revokingToken, setRevokingToken] = useState<string | null>(null)

  // Convert backend URL to frontend URL
  const getFrontendUrl = (token: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/share/${token}`
    }
    return token
  }

  const handleCopy = async (token: string) => {
    try {
      const frontendUrl = getFrontendUrl(token)
      await navigator.clipboard.writeText(frontendUrl)
      setCopiedToken(token)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopiedToken(null), 2000)
    } catch (_error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleOpenInNewTab = (token: string) => {
    const frontendUrl = getFrontendUrl(token)
    window.open(frontendUrl, '_blank')
    onOpenChange(false) // Close dialog after opening in new tab
  }

  const handleRevoke = async (token: string) => {
    if (!confirm('Are you sure you want to revoke this share link? This action cannot be undone.')) {
      return
    }

    setRevokingToken(token)

    try {
      await revokeShareLink(token)
      toast.success('Share link revoked successfully')
      onRevoke?.()
      onOpenChange(false) // Close dialog after successful revoke
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to revoke share link')
    } finally {
      setRevokingToken(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffMs < 0) {
      return 'Expired'
    } else if (diffHours < 24) {
      return `Expires in ${diffHours}h`
    } else {
      return `Expires in ${diffDays}d`
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Share Links for &quot;{fileName}&quot;</DialogTitle>
          <DialogDescription>
            {shareLinks.length === 0
              ? 'No active share links for this file'
              : `${shareLinks.length} active share ${shareLinks.length === 1 ? 'link' : 'links'}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto">
          {shareLinks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Link2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No share links yet</p>
              <p className="text-sm">Create one to share this file</p>
            </div>
          ) : (
            shareLinks.map((link) => (
              <div
                key={link.token}
                className="border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {link.hasPassword ? '🔒' : '🔓'} Share Link
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Accessed {link.accessCount} {link.accessCount === 1 ? 'time' : 'times'}
                      </span>
                    </div>
                    <code className="text-xs bg-muted px-2 py-1 rounded block truncate">
                      {getFrontendUrl(link.token)}
                    </code>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(link.expiresAt)}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleOpenInNewTab(link.token)}
                      variant="outline"
                      size="sm"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open
                    </Button>
                    <Button
                      onClick={() => handleCopy(link.token)}
                      variant="outline"
                      size="sm"
                    >
                      {copiedToken === link.token ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleRevoke(link.token)}
                      variant="destructive"
                      size="sm"
                      disabled={revokingToken === link.token}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      {revokingToken === link.token ? 'Revoking...' : 'Revoke'}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
