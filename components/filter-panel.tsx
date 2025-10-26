'use client'

import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import type { FileFilters } from '@/lib/types'

interface FilterPanelProps {
  filters: FileFilters
  onFiltersChange: (filters: FileFilters) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
}

const MIME_TYPES = [
  { value: '', label: 'All types' },
  // { value: "image/", label: "Images (all)" },
  { value: 'image/jpeg', label: 'JPEG Images' },
  { value: 'image/png', label: 'PNG Images' },
  { value: 'image/gif', label: 'GIF Images' },
  { value: 'image/webp', label: 'WebP Images' },
  // { value: "video/", label: "Videos (all)" },
  { value: 'video/mp4', label: 'MP4 Videos' },
  { value: 'application/pdf', label: 'PDF Documents' },
  { value: 'application/msword', label: 'Word Documents' },
  { value: 'application/vnd.openxmlformats-officedocument', label: 'Office Documents' },
  // { value: "text/", label: "Text Files (all)" },
  // { value: "audio/", label: "Audio Files (all)" },
  { value: 'application/zip', label: 'ZIP Archives' },
]

const SIZE_PRESETS = [
  { key: 'any', label: 'Any size', minSize: undefined, maxSize: undefined },
  { key: 'small', label: '< 1 MB', minSize: undefined, maxSize: 1048576 },
  { key: 'medium', label: '1-10 MB', minSize: 1048576, maxSize: 10485760 },
  { key: 'large', label: '10-100 MB', minSize: 10485760, maxSize: 104857600 },
  { key: 'xlarge', label: '> 100 MB', minSize: 104857600, maxSize: undefined },
]

const DATE_PRESETS = [
  { label: 'Any time', days: undefined },
  { label: 'Today', days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last year', days: 365 },
]

export function FilterPanel({
  filters,
  onFiltersChange,
  onClearFilters,
  hasActiveFilters,
}: FilterPanelProps) {
  // Track which date preset is currently active
  const [activeDatePreset, setActiveDatePreset] = useState<number | undefined | null>(
    null
  )
  const [activeSizePreset, setActiveSizePreset] = useState<string | null>(null)

  // Reset preset when filters are cleared from outside
  useEffect(() => {
    if (!filters.dateFrom && !filters.dateTo) {
      setActiveDatePreset(undefined)
    }
    if (filters.minSize === undefined && filters.maxSize === undefined) {
      setActiveSizePreset('any')
    }
  }, [filters.dateFrom, filters.dateTo, filters.minSize, filters.maxSize])

  const updateFilter = (key: keyof FileFilters, value: string | number | undefined) => {
    // If manually changing date fields, clear the preset
    if (key === 'dateFrom' || key === 'dateTo') {
      setActiveDatePreset(null)
    }

    // If manually changing size fields, clear the preset
    if (key === 'minSize' || key === 'maxSize') {
      setActiveSizePreset(null)
    }

    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const handleSizePreset = (
    minSize: number | undefined,
    maxSize: number | undefined,
    presetKey: string
  ) => {
    setActiveSizePreset(presetKey)
    onFiltersChange({
      ...filters,
      minSize,
      maxSize,
    })
  }

  const handleDatePreset = (days: number | undefined) => {
    // Store which preset was selected
    setActiveDatePreset(days)

    if (days === undefined) {
      onFiltersChange({
        ...filters,
        dateFrom: undefined,
        dateTo: undefined,
      })
      return
    }

    const now = new Date()
    const from = new Date()

    if (days === 0) {
      from.setHours(0, 0, 0, 0)
    } else {
      from.setDate(from.getDate() - days)
    }

    onFiltersChange({
      ...filters,
      dateFrom: from.toISOString(),
      dateTo: now.toISOString(),
    })
  }

  return (
    <div className="space-y-6">
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-8 px-2">
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        </div>
      )}
      {/* File Type Filter */}
      <div className="space-y-2">
        <Label htmlFor="mime-filter">File Type</Label>
        <Select
          id="mime-filter"
          value={filters.mime || ''}
          onChange={(e) => updateFilter('mime', e.target.value || undefined)}
        >
          {MIME_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
      </div>

      {/* File Size Filter */}
      <div className="space-y-2">
        <Label>File Size</Label>
        <div className="grid grid-cols-2 gap-2">
          {SIZE_PRESETS.map((preset) => (
            <Button
              key={preset.key}
              variant={activeSizePreset === preset.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSizePreset(preset.minSize, preset.maxSize, preset.key)}
              className="h-8 text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div>
            <Label htmlFor="min-size" className="text-xs">
              Min (bytes)
            </Label>
            <Input
              id="min-size"
              type="number"
              placeholder="Min"
              value={filters.minSize || ''}
              onChange={(e) =>
                updateFilter(
                  'minSize',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="h-9 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="max-size" className="text-xs">
              Max (bytes)
            </Label>
            <Input
              id="max-size"
              type="number"
              placeholder="Max"
              value={filters.maxSize || ''}
              onChange={(e) =>
                updateFilter(
                  'maxSize',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="h-9 mt-1"
            />
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="space-y-2">
        <Label>Upload Date</Label>
        <div className="grid grid-cols-2 gap-2">
          {DATE_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant={activeDatePreset === preset.days ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDatePreset(preset.days)}
              className="h-8 text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div>
            <Label htmlFor="date-from" className="text-xs">
              From
            </Label>
            <Input
              id="date-from"
              type="date"
              value={
                filters.dateFrom
                  ? new Date(filters.dateFrom).toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) =>
                updateFilter(
                  'dateFrom',
                  e.target.value ? new Date(e.target.value).toISOString() : undefined
                )
              }
              className="h-9 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="date-to" className="text-xs">
              To
            </Label>
            <Input
              id="date-to"
              type="date"
              value={
                filters.dateTo ? new Date(filters.dateTo).toISOString().split('T')[0] : ''
              }
              onChange={(e) =>
                updateFilter(
                  'dateTo',
                  e.target.value
                    ? new Date(`${e.target.value}T23:59:59`).toISOString()
                    : undefined
                )
              }
              className="h-9 mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
