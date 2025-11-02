'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import type { PaginationMetadata } from '@/lib/types'

interface PaginationProps {
  pagination: PaginationMetadata
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export function Pagination({ pagination, onPageChange, onLimitChange }: PaginationProps) {
  const { page, limit, total, totalPages } = pagination

  const firstIndex = total === 0 ? 0 : (page - 1) * limit + 1
  const lastIndex = Math.min(page * limit, total)

  const getPageNumbers = () => {
    const delta = 2 // Pages to each side of the current page
    const range: (number | string)[] = []

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i)
    }

    if (page - delta > 2) {
      range.unshift('...')
    }
    if (page + delta < totalPages - 1) {
      range.push('...')
    }

    range.unshift(1)
    if (totalPages > 1) {
      range.push(totalPages)
    }

    return range
  }

  if (total === 0) {
    return null
  }

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4"
      role="navigation"
      aria-label="Paginación"
    >
      {/* Info */}
      <div className="text-sm text-muted-foreground" aria-live="polite">
        Showing {firstIndex}-{lastIndex} of {total} results
      </div>

      {/* Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="h-10 w-10 p-0 md:h-8 md:w-8"
            title="Página anterior"
            aria-label="Ir a página anterior"
          >
            <ChevronLeft className="h-5 w-5 md:h-4 md:w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((pageNum, idx) =>
              pageNum === '...' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-muted-foreground"
                  aria-hidden="true"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(pageNum as number)}
                  className="h-10 w-10 p-0 md:h-8 md:w-8"
                  aria-label={`Ir a página ${pageNum}`}
                  aria-current={page === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </Button>
              )
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="h-10 w-10 p-0 md:h-8 md:w-8"
            title="Página siguiente"
            aria-label="Ir a página siguiente"
          >
            <ChevronRight className="h-5 w-5 md:h-4 md:w-4" />
          </Button>
        </div>
      )}

      {/* Page Size Selector */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="page-size-select"
          className="text-sm text-muted-foreground whitespace-nowrap"
        >
          Per page:
        </label>
        <Select
          id="page-size-select"
          value={String(limit)}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="h-10 w-20 md:h-8"
          aria-label="Seleccionar cantidad de elementos por página"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </Select>
      </div>
    </div>
  )
}
