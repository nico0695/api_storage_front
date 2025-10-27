'use client'

import { Link2, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
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
import { Select } from '@/components/ui/select'
import { createShareLink } from '@/lib/api'

interface ShareLinkDialogProps {
  fileId: number
  fileName: string
  onSuccess?: () => void
  trigger?: React.ReactNode
}

const TTL_PRESETS = [
  { label: '1 hour', value: 3600 },
  { label: '1 day', value: 86400 },
  { label: '7 days', value: 604800 },
  { label: '30 days', value: 2592000 },
]

export function ShareLinkDialog({ fileId, fileName, onSuccess, trigger }: ShareLinkDialogProps) {
  const [open, setOpen] = useState(false)
  const [ttl, setTtl] = useState(604800) // 7 days default
  const [password, setPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCreate = async () => {
    setCreating(true)

    try {
      const request: { ttl: string; password?: string } = { ttl: ttl.toString() }

      if (password.trim()) {
        request.password = password.trim()
      }

      const response = await createShareLink(fileId, request)
      // Use frontend URL instead of backend URL
      const frontendUrl = `${window.location.origin}/share/${response.token}`
      setShareUrl(frontendUrl)
      toast.success('Share link created successfully')
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create share link')
    } finally {
      setCreating(false)
    }
  }

  const handleCopyToClipboard = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        toast.success('Link copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
      } catch (_error) {
        toast.error('Failed to copy to clipboard')
      }
    }
  }

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      // Reset form when dialog closes
      setTtl(604800)
      setPassword('')
      setShareUrl(null)
      setCopied(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Link2 className="h-4 w-4 mr-2" />
            Create Share Link
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share &quot;{fileName}&quot;</DialogTitle>
          <DialogDescription>
            Create a secure share link for this file
          </DialogDescription>
        </DialogHeader>

        {!shareUrl ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ttl">Expiration</Label>
              <Select
                id="ttl"
                value={ttl.toString()}
                onChange={(e) => setTtl(Number(e.target.value))}
              >
                {TTL_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password (Optional)</Label>
              <Input
                id="password"
                type="password"
                placeholder="Leave empty for no password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button onClick={handleCreate} disabled={creating} className="w-full">
              {creating ? 'Creating...' : 'Create Share Link'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Share URL</Label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  onClick={handleCopyToClipboard}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>✓ Link created successfully</p>
              <p>✓ Expires in {TTL_PRESETS.find(p => p.value === ttl)?.label.toLowerCase()}</p>
              {password && <p>✓ Password protected 🔒</p>}
            </div>

            <Button onClick={() => handleClose(false)} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
