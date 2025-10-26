"use client"

import { useEffect, useState } from "react"
import { Download, Eye, Trash2, FileIcon, Image, Video, FileText } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { listFiles, getFileDetails } from "@/lib/api"
import { formatFileSize, formatDate } from "@/lib/utils"
import type { FileItem } from "@/lib/types"
import { DeleteDialog } from "./delete-dialog"

interface FileListProps {
  refreshTrigger?: number
}

export function FileList({ refreshTrigger }: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const response = await listFiles()
      setFiles(response.files)
    } catch (error) {
      toast.error("Failed to fetch files")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [refreshTrigger])

  const handleDownload = async (id: number) => {
    try {
      const file = await getFileDetails(id)
      if (file.downloadUrl) {
        window.open(file.downloadUrl, "_blank")
        toast.success("Download link opened")
      } else {
        toast.error("Download URL not available")
      }
    } catch (error) {
      toast.error("Failed to get download URL")
    }
  }

  const handleDelete = (file: FileItem) => {
    setSelectedFile(file)
    setDeleteDialogOpen(true)
  }

  const handleDeleteSuccess = () => {
    fetchFiles()
    setDeleteDialogOpen(false)
    setSelectedFile(null)
  }

  const getMimeIcon = (mime: string) => {
    if (mime.startsWith("image/")) return <Image className="h-4 w-4" />
    if (mime.startsWith("video/")) return <Video className="h-4 w-4" />
    if (mime.startsWith("text/") || mime === "application/pdf")
      return <FileText className="h-4 w-4" />
    return <FileIcon className="h-4 w-4" />
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (files.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No files uploaded yet. Click "Add File" to upload your first file.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Files ({files.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMimeIcon(file.mime)}
                      <div>
                        <p className="font-medium">
                          {file.customName || file.name}
                        </p>
                        {file.customName && (
                          <p className="text-xs text-muted-foreground">
                            {file.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {file.mime}
                  </TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(file.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(file.id)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(file)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        file={selectedFile}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </>
  )
}
