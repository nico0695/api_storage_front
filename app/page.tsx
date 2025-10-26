'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FileList } from '@/components/file-list'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { UploadDialog } from '@/components/upload-dialog'
import { isAuthenticated, logout } from '@/lib/auth'

export default function Home() {
  const router = useRouter()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push('/login')
    }
  }, [router])

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!mounted || !isAuthenticated()) {
    return null
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">API Storage</h1>
            <p className="text-muted-foreground">
              Upload and manage your files in Backblaze B2 storage
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-end">
          <UploadDialog onUploadSuccess={handleUploadSuccess} />
        </div>
        <FileList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  )
}
