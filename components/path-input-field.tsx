'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { validatePath, type PathStatus } from '@/lib/path-validation'

interface PathInputFieldProps {
  value: string
  onChange: (value: string) => void
  onStatusChange: (status: PathStatus) => void
  id?: string
  label?: string
  placeholder?: string
  helperText?: string
  disabled?: boolean
}

export function PathInputField({
  value,
  onChange,
  onStatusChange,
  id = 'path',
  label = 'Folder Path (Optional)',
  placeholder = 'e.g., documents/invoices',
  helperText = 'Organize files into folders. Leave empty for root level.',
  disabled = false,
}: PathInputFieldProps) {
  const [status, setStatus] = useState<PathStatus>('idle')
  const [error, setError] = useState<string>()

  useEffect(() => {
    const validation = validatePath(value)
    setStatus(validation.status)
    setError(validation.error)
    onStatusChange(validation.status)
  }, [value, onStatusChange])

  const renderStatus = () => {
    if (status === 'idle') {
      return <p className="text-muted-foreground">{helperText}</p>
    }

    const isValid = status === 'valid'

    return (
      <div
        className={`flex items-center gap-2 ${
          isValid ? 'text-emerald-600' : 'text-destructive'
        }`}
      >
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            isValid ? 'bg-emerald-500' : 'bg-destructive'
          }`}
          aria-hidden="true"
        />
        <span>{isValid ? 'Valid path' : error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={status === 'invalid' ? 'border-destructive' : ''}
        aria-describedby={`${id}-help`}
      />
      <div id={`${id}-help`} className="text-sm">
        {renderStatus()}
      </div>
    </div>
  )
}
