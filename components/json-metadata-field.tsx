'use client'

import { useCallback, useEffect, useRef, type KeyboardEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  determineMetadataStatus,
  formatMetadataValue,
  type MetadataStatus,
} from '@/lib/json-metadata'

interface MetadataJsonFieldProps {
  value: string
  status: MetadataStatus
  onChange: (value: string) => void
  onStatusChange: (status: MetadataStatus) => void
  id?: string
  label?: string
  placeholder?: string
  helperText?: string
}

const DEFAULT_PLACEHOLDER = '{"author": "John Doe", "tags": ["important"]}'
const JSON_INDENT = '  '
const TYPING_SNAPSHOT_INTERVAL = 450
const AUTO_PAIRS: Record<string, string> = {
  '{': '}',
  '[': ']',
  '"': '"',
}

const CLOSING_TO_OPEN: Record<string, string> = {
  '}': '{',
  ']': '[',
  '"': '"',
}

type HistoryMode = 'typing' | 'command' | 'skip'

interface HistoryState {
  stack: string[]
  index: number
  lastTypingSnapshot: number
}

export function MetadataJsonField({
  value,
  status,
  onChange,
  onStatusChange,
  id = 'metadata',
  label = 'Metadata (Optional JSON)',
  placeholder = DEFAULT_PLACEHOLDER,
  helperText = 'Describe tags, authors, etc. in JSON.',
}: MetadataJsonFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const historyRef = useRef<HistoryState>({
    stack: [value],
    index: 0,
    lastTypingSnapshot: Date.now(),
  })

  const recordSnapshot = useCallback((nextValue: string, mode: 'typing' | 'command') => {
    const history = historyRef.current

    if (history.stack[history.index] === nextValue) {
      return
    }

    const now = Date.now()

    if (history.index < history.stack.length - 1) {
      history.stack = history.stack.slice(0, history.index + 1)
      history.index = history.stack.length - 1
    }

    if (mode === 'typing') {
      if (now - history.lastTypingSnapshot > TYPING_SNAPSHOT_INTERVAL) {
        history.stack.push(nextValue)
        history.index = history.stack.length - 1
        history.lastTypingSnapshot = now
      } else {
        history.stack[history.stack.length - 1] = nextValue
        history.index = history.stack.length - 1
      }
      return
    }

    history.stack.push(nextValue)
    history.index = history.stack.length - 1
    history.lastTypingSnapshot = now
  }, [])

  const handleChangeValue = useCallback(
    (nextValue: string, options?: { historyMode?: HistoryMode }) => {
      onChange(nextValue)
      onStatusChange(determineMetadataStatus(nextValue))

      const historyMode = options?.historyMode ?? 'typing'

      if (historyMode === 'skip') {
        return
      }

      recordSnapshot(nextValue, historyMode === 'command' ? 'command' : 'typing')
    },
    [onChange, onStatusChange, recordSnapshot]
  )

  const runTextOperation = useCallback(
    (
      insertedText: string,
      selectionStart: number,
      selectionEnd: number,
      cursorStart: number,
      cursorEnd: number
    ) => {
      const target = textareaRef.current
      if (!target) {
        return
      }

      const doc = target.ownerDocument
      let commandApplied = false

      if (
        doc &&
        typeof doc.queryCommandSupported === 'function' &&
        doc.queryCommandSupported('insertText')
      ) {
        try {
          target.setSelectionRange(selectionStart, selectionEnd)
          commandApplied = doc.execCommand('insertText', false, insertedText)
        } catch {
          commandApplied = false
        }
      }

      if (!commandApplied) {
        target.setRangeText(insertedText, selectionStart, selectionEnd, 'end')
      }

      handleChangeValue(target.value, { historyMode: 'command' })

      requestAnimationFrame(() => {
        const element = textareaRef.current
        if (!element) {
          return
        }
        element.setSelectionRange(cursorStart, cursorEnd)
      })
    },
    [handleChangeValue]
  )

  const attemptFormat = () => {
    if (!value.trim()) {
      toast.info('Add metadata before formatting')
      return
    }

    const formatted = formatMetadataValue(value, true)

    if (formatted !== null) {
      handleChangeValue(formatted, { historyMode: 'command' })
      return
    }

    toast.error('Unable to format metadata. Please fix the JSON syntax.')
    onStatusChange('invalid')
  }

  const handleBlur = () => {
    if (!value.trim() || status === 'valid') {
      return
    }

    const formatted = formatMetadataValue(value, true)
    if (formatted !== null) {
      handleChangeValue(formatted, { historyMode: 'command' })
    }
  }

  const applyHistoryStep = useCallback(
    (direction: -1 | 1) => {
      const history = historyRef.current
      const nextIndex = history.index + direction

      if (nextIndex < 0 || nextIndex >= history.stack.length) {
        return
      }

      history.index = nextIndex
      history.lastTypingSnapshot = Date.now()
      const nextValue = history.stack[nextIndex]

      handleChangeValue(nextValue, { historyMode: 'skip' })

      requestAnimationFrame(() => {
        const element = textareaRef.current
        if (!element) {
          return
        }
        const pos = Math.min(nextValue.length, element.value.length)
        element.setSelectionRange(pos, pos)
      })
    },
    [handleChangeValue]
  )

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const target = textareaRef.current
    if (!target) {
      return
    }

    const { key, metaKey, ctrlKey, shiftKey, altKey } = event

    if (metaKey || ctrlKey) {
      if (key.toLowerCase() === 'z') {
        event.preventDefault()
        applyHistoryStep(shiftKey ? 1 : -1)
      }
      return
    }

    if (altKey) {
      return
    }

    const selectionStart = target.selectionStart ?? value.length
    const selectionEnd = target.selectionEnd ?? value.length
    const hasSelection = selectionStart !== selectionEnd
    const selectedText = value.slice(selectionStart, selectionEnd)

    if (key === 'Tab') {
      event.preventDefault()
      runTextOperation(
        JSON_INDENT,
        selectionStart,
        selectionEnd,
        selectionStart + JSON_INDENT.length,
        selectionStart + JSON_INDENT.length
      )
      return
    }

    const autoPair = AUTO_PAIRS[key]
    if (autoPair) {
      if (key === '"' && value[selectionStart - 1] === '\\') {
        return
      }

      event.preventDefault()
      const insertion = hasSelection ? `${key}${selectedText}${autoPair}` : `${key}${autoPair}`
      const cursorStart = selectionStart + 1
      const cursorEnd = hasSelection ? cursorStart + selectedText.length : cursorStart
      runTextOperation(insertion, selectionStart, selectionEnd, cursorStart, cursorEnd)

      return
    }

    const expectedOpen = CLOSING_TO_OPEN[key]
    if (
      expectedOpen &&
      !hasSelection &&
      value[selectionStart] === key &&
      value[selectionStart - 1] !== '\\'
    ) {
      event.preventDefault()
      requestAnimationFrame(() => {
        const element = textareaRef.current
        if (!element) {
          return
        }
        const nextPos = selectionStart + 1
        element.setSelectionRange(nextPos, nextPos)
      })
    }
  }

  useEffect(() => {
    const history = historyRef.current
    if (history.stack[history.index] !== value) {
      historyRef.current = {
        stack: [value],
        index: 0,
        lastTypingSnapshot: Date.now(),
      }
    }
  }, [value])

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
        <span>{isValid ? 'Valid JSON' : 'Invalid JSON'}</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(event) => handleChangeValue(event.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        ref={textareaRef}
        className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <div className="flex items-center justify-between gap-4 text-sm">
        {renderStatus()}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={attemptFormat}
          disabled={!value.trim()}
        >
          Format JSON
        </Button>
      </div>
    </div>
  )
}
