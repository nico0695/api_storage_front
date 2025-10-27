'use client'

import { Download, Trash2, FileIcon, Image, Video, FileText, Filter, Link2, Copy, Share2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { listFiles, getFileDetails } from '@/lib/api'
import type { FileItem, FileFilters, PaginationMetadata } from '@/lib/types'
import { formatFileSize, formatDate } from '@/lib/utils'
import { DeleteDialog } from './delete-dialog'
import { FilterPanel } from './filter-panel'
import { Pagination } from './pagination'
import { SearchBar } from './search-bar'
import { ShareLinkDialog } from './share-link-dialog'
import { ShareLinksDisplay } from './share-links-display'
import { ShareDialog } from './share-dialog'

interface FileListProps {
  refreshTrigger?: number
}

const DEFAULT_LIMIT = 20

export function FileList({ refreshTrigger }: FileListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [files, setFiles] = useState<FileItem[]>([])
  const [pagination, setPagination] = useState<PaginationMetadata>({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [shareLinksDialogOpen, setShareLinksDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FileFilters>(() => {
    const params: FileFilters = {
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || DEFAULT_LIMIT,
    }

    const search = searchParams.get('search')
    const mime = searchParams.get('mime')
    const minSize = searchParams.get('minSize')
    const maxSize = searchParams.get('maxSize')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (search) {
      params.search = search
    }
    if (mime) {
      params.mime = mime
    }
    if (minSize) {
      params.minSize = Number(minSize)
    }
    if (maxSize) {
      params.maxSize = Number(maxSize)
    }
    if (dateFrom) {
      params.dateFrom = dateFrom
    }
    if (dateTo) {
      params.dateTo = dateTo
    }

    return params
  })

  // Update URL when filters change
  const updateURL = (newFilters: FileFilters) => {
    const params = new URLSearchParams()

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.set(key, String(value))
      }
    })

    router.push(`?${params.toString()}`, { scroll: false })
  }

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const response = await listFiles(filters)
      setFiles(response.files)

      // Update pagination if backend provides it, otherwise calculate it
      if (response.pagination) {
        setPagination(response.pagination)
      } else {
        setPagination({
          page: filters.page || 1,
          limit: filters.limit || DEFAULT_LIMIT,
          total: response.files.length,
          totalPages: 1,
        })
      }
    } catch (_error) {
      toast.error('Failed to fetch files')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [filters, refreshTrigger])

  const handleDownload = async (id: number) => {
    try {
      const file = await getFileDetails(id)
      if (file.downloadUrl) {
        window.open(file.downloadUrl, '_blank')
        toast.success('Download link opened')
      } else {
        toast.error('Download URL not available')
      }
    } catch (_error) {
      toast.error('Failed to get download URL')
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

  const handleCopyShareLink = async (token: string) => {
    try {
      const frontendUrl = `${window.location.origin}/share/${token}`
      await navigator.clipboard.writeText(frontendUrl)
      toast.success('Share link copied to clipboard!')
    } catch (_error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleViewShareLinks = (file: FileItem) => {
    setSelectedFile(file)
    setShareLinksDialogOpen(true)
  }

  const handleShareSuccess = () => {
    fetchFiles() // Refresh to get updated share links
  }

  const handleSearchChange = (search: string) => {
    const newFilters = { ...filters, search: search || undefined, page: 1 }
    setFilters(newFilters)
    updateURL(newFilters)
  }

  const handleFiltersChange = (newFilters: FileFilters) => {
    const updatedFilters = { ...newFilters, page: 1 }
    setFilters(updatedFilters)
    updateURL(updatedFilters)
  }

  const handleClearFilters = () => {
    const newFilters: FileFilters = {
      page: 1,
      limit: filters.limit || DEFAULT_LIMIT,
    }
    setFilters(newFilters)
    updateURL(newFilters)
  }

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page }
    setFilters(newFilters)
    updateURL(newFilters)
  }

  const handleLimitChange = (limit: number) => {
    const newFilters = { ...filters, limit, page: 1 }
    setFilters(newFilters)
    updateURL(newFilters)
  }

  const hasActiveFilters =
    !!filters.search ||
    !!filters.mime ||
    filters.minSize !== undefined ||
    filters.maxSize !== undefined ||
    !!filters.dateFrom ||
    !!filters.dateTo

  const activeFilterCount = [
    filters.search,
    filters.mime,
    filters.minSize,
    filters.maxSize,
    filters.dateFrom,
    filters.dateTo,
  ].filter((f) => f !== undefined && f !== '').length

  const getMimeIcon = (mime: string) => {
    if (mime.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    }
    if (mime.startsWith('video/')) {
      return <Video className="h-4 w-4" />
    }
    if (mime.startsWith('text/') || mime === 'application/pdf') {
      return <FileText className="h-4 w-4" />
    }
    return <FileIcon className="h-4 w-4" />
  }

  return (
    <>
      {/* Search Bar and Filter Button */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar value={filters.search || ''} onChange={handleSearchChange} />
        </div>
        <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Filter Files</DialogTitle>
              <DialogDescription>
                Refine your search with advanced filters
              </DialogDescription>
            </DialogHeader>
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Files Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Files ({pagination.total})
            {hasActiveFilters && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (filtered)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : files.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {hasActiveFilters
                ? 'No files found matching your filters. Try adjusting your search criteria.'
                : 'No files uploaded yet. Click "Add File" to upload your first file.'}
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Share</TableHead>
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
                            <p className="font-medium">{file.customName || file.name}</p>
                            {file.customName && (
                              <p className="text-xs text-muted-foreground">{file.name}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{file.mime}</TableCell>
                      <TableCell>{formatFileSize(file.size)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(file.createdAt)}
                      </TableCell>
                      <TableCell>
                        {file.shareLinks && file.shareLinks.length > 0 ? (
                          <button
                            onClick={() => handleViewShareLinks(file)}
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            <Link2 className="h-3 w-3" />
                            {file.shareLinks.length} {file.shareLinks.length === 1 ? 'share' : 'shares'}
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {file.shareLinks && file.shareLinks.length > 0 && (
                            <ShareDialog
                              fileName={file.customName || file.name}
                              shareUrl={`${window.location.origin}/share/${file.shareLinks[0].token}`}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Share file"
                                >
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              }
                            />
                          )}
                          {file.shareLinks && file.shareLinks.length > 0 ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyShareLink(file.shareLinks![0].token)}
                              title="Copy share link"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          ) : (
                            <ShareLinkDialog
                              fileId={file.id}
                              fileName={file.customName || file.name}
                              onSuccess={handleShareSuccess}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Create share link"
                                >
                                  <Link2 className="h-4 w-4" />
                                </Button>
                              }
                            />
                          )}
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

              {/* Pagination */}
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            </>
          )}
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        file={selectedFile}
        onDeleteSuccess={handleDeleteSuccess}
      />

      <ShareLinksDisplay
        open={shareLinksDialogOpen}
        onOpenChange={setShareLinksDialogOpen}
        fileName={selectedFile?.customName || selectedFile?.name || ''}
        shareLinks={selectedFile?.shareLinks || []}
        onRevoke={handleShareSuccess}
      />
    </>
  )
}
