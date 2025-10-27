'use client'

import { toast } from 'sonner'

interface ShareDialogProps {
  fileName: string
  shareUrl: string
  trigger: React.ReactNode
}

export function ShareDialog({ fileName, shareUrl, trigger }: ShareDialogProps) {
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: fileName,
          text: `Check out this file: ${fileName}`,
          url: shareUrl,
        })
        toast.success('Shared successfully!')
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share')
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied to clipboard!')
      } catch (_error) {
        toast.error('Sharing not supported on this device')
      }
    }
  }

  return (
    <div onClick={handleNativeShare}>
      {trigger}
    </div>
  )
}
