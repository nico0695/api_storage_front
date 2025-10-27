'use client'

import {
  Download,
  Lock,
  FileIcon,
  Image as ImageIcon,
  Video,
  FileText,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { accessSharedFile } from '@/lib/api'
import type { SharedFileAccessResponse, SharedFileErrorResponse } from '@/lib/types'
import { formatFileSize, formatDate } from '@/lib/utils'

export default function SharedFilePage() {
  const params = useParams()
  const token = params.token as string

  const [fileData, setFileData] = useState<SharedFileAccessResponse | null>(null)
  const [requiresPassword, setRequiresPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showCheckerboard, setShowCheckerboard] = useState(false)

  const fetchFile = async (pwd?: string) => {
    try {
      setError(null)
      const data = await accessSharedFile(token, pwd)
      setFileData(data)
      setRequiresPassword(false)
    } catch (err) {
      const errorResponse = err as SharedFileErrorResponse

      if (errorResponse.requiresPassword) {
        setRequiresPassword(true)
        setError(null)
      } else {
        setError(errorResponse.error || 'Failed to access file')
      }
    } finally {
      setLoading(false)
      setPasswordLoading(false)
    }
  }

  useEffect(() => {
    fetchFile()
  }, [token])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    fetchFile(password)
  }

  const handleDownload = () => {
    if (fileData?.downloadUrl) {
      window.open(fileData.downloadUrl, '_blank')
    }
  }

  const getMimeIcon = (mime: string) => {
    if (mime.startsWith('image/')) {
      return <ImageIcon className="h-12 w-12 text-blue-500" />
    }
    if (mime.startsWith('video/')) {
      return <Video className="h-12 w-12 text-purple-500" />
    }
    if (mime.startsWith('text/') || mime === 'application/pdf') {
      return <FileText className="h-12 w-12 text-green-500" />
    }
    return <FileIcon className="h-12 w-12 text-gray-500" />
  }

  const isImage = (mime: string) => mime.startsWith('image/')

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading shared file...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error && !requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Unable to Access File</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• This link may have expired</p>
              <p>• This link may have been revoked</p>
              <p>• The file may no longer exist</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Password required state
  if (requiresPassword && !fileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Password Required</CardTitle>
            </div>
            <CardDescription>This file is password protected</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={passwordLoading}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={passwordLoading}>
                {passwordLoading ? 'Verifying...' : 'Access File'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state - show file
  if (fileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="shrink-0">{getMimeIcon(fileData.file.mime)}</div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-2xl mb-1">
                  {fileData.file.customName || fileData.file.name}
                </CardTitle>
                {fileData.file.customName && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {fileData.file.name}
                  </p>
                )}
                <CardDescription>
                  Shared file • Accessed {fileData.accessCount}{' '}
                  {fileData.accessCount === 1 ? 'time' : 'times'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Image Preview */}
            {isImage(fileData.file.mime) && (
              <div
                className={`rounded-lg border overflow-hidden bg-white dark:bg-slate-50 ${showCheckerboard ? 'checkerboard-bg' : ''} relative h-[30vh] md:h-[40vh] max-h-[300px] md:max-h-[400px] flex items-center justify-center`}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => setShowCheckerboard(!showCheckerboard)}
                >
                  {showCheckerboard ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Image
                  src={fileData.downloadUrl}
                  alt={fileData.file.customName || fileData.file.name}
                  fill
                  style={{ objectFit: 'contain' }}
                  className="object-contain"
                />
              </div>
            )}

            {/* File Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-medium">{fileData.file.mime}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Size</p>
                <p className="font-medium">{formatFileSize(fileData.file.size)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Uploaded</p>
                <p className="font-medium">{formatDate(fileData.file.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Expires</p>
                <p className="font-medium">{formatDate(fileData.expiresAt)}</p>
              </div>
            </div>

            {/* Download Button */}
            <Button onClick={handleDownload} className="w-full" size="lg">
              <Download className="h-5 w-5 mr-2" />
              Download File
            </Button>

            {/* Footer */}
            <div className="text-center pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Shared securely via API Storage
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
