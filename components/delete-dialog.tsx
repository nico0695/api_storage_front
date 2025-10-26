"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { deleteFile } from "@/lib/api"
import type { FileItem } from "@/lib/types"

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: FileItem | null
  onDeleteSuccess: () => void
}

export function DeleteDialog({
  open,
  onOpenChange,
  file,
  onDeleteSuccess,
}: DeleteDialogProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!file) return

    setDeleting(true)

    try {
      await deleteFile(file.id)
      toast.success("File deleted successfully")
      onDeleteSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete file")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete File</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this file? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {file && (
          <div className="py-4">
            <p className="font-medium">{file.customName || file.name}</p>
            {file.customName && (
              <p className="text-sm text-muted-foreground">{file.name}</p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
