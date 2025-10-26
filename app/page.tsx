"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload"
import { FileList } from "@/components/file-list"

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Storage</h1>
        <p className="text-muted-foreground">
          Upload and manage your files in Backblaze B2 storage
        </p>
      </div>

      <div className="space-y-8">
        <FileUpload onUploadSuccess={handleUploadSuccess} />
        <FileList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  )
}
