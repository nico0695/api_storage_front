export type MetadataStatus = 'idle' | 'valid' | 'invalid'

const KEY_PATTERN = /([{,]\s*)([A-Za-z_][A-Za-z0-9_-]*)\s*:/g
const KEY_LINE_PATTERN = /^(\s*)([A-Za-z_][A-Za-z0-9_-]*)\s*:/gm

const normalizeKeyQuotes = (value: string): string => {
  let result = value.replace(KEY_PATTERN, (_, prefix, key) => `${prefix}"${key}":`)
  result = result.replace(KEY_LINE_PATTERN, (_, whitespace, key) => `${whitespace}"${key}":`)
  return result
}

const normalizeSingleQuotedSegments = (value: string): string => {
  let result = ''
  let buffer = ''
  let inDouble = false
  let inSingle = false
  let escaped = false

  for (const char of value) {
    if (inSingle) {
      if (escaped) {
        if (char === "'") {
          buffer += "'"
        } else {
          buffer += `\\${char}`
        }
        escaped = false
        continue
      }

      if (char === '\\') {
        escaped = true
        continue
      }

      if (char === "'") {
        inSingle = false
        result += `"${buffer.replace(/"/g, '\\"')}"`
        buffer = ''
        continue
      }

      buffer += char
      continue
    }

    if (escaped) {
      result += char
      escaped = false
      continue
    }

    if (char === '\\') {
      result += char
      escaped = true
      continue
    }

    if (char === '"' && !inSingle) {
      inDouble = !inDouble
      result += char
      continue
    }

    if (char === "'" && !inDouble) {
      inSingle = true
      buffer = ''
      continue
    }

    result += char
  }

  if (inSingle) {
    result += `"${buffer.replace(/"/g, '\\"')}"`
  }

  return result
}

const stripLooseSemicolons = (value: string): string => {
  let inDouble = false
  let inSingle = false
  let escaped = false
  let result = ''

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i]

    if (escaped) {
      result += char
      escaped = false
      continue
    }

    if (char === '\\') {
      result += char
      escaped = true
      continue
    }

    if (char === '"' && !inSingle) {
      inDouble = !inDouble
      result += char
      continue
    }

    if (char === "'" && !inDouble) {
      inSingle = !inSingle
      result += char
      continue
    }

    if (!inSingle && !inDouble && char === ';') {
      const remainder = value.slice(i + 1)
      const whitespaceMatch = remainder.match(/^\s*/)
      const whitespace = whitespaceMatch ? whitespaceMatch[0] : ''
      const nextChar = remainder[whitespace.length]

      if (!nextChar || nextChar === '\n' || nextChar === '\r' || nextChar === '}' || nextChar === ']') {
        i += whitespace.length
        result += whitespace
        continue
      }
    }

    result += char
  }

  return result
}

const removeTrailingCommas = (value: string): string => {
  let result = ''
  let inDouble = false
  let inSingle = false
  let escaped = false

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i]

    if (escaped) {
      result += char
      escaped = false
      continue
    }

    if (char === '\\') {
      result += char
      escaped = true
      continue
    }

    if (char === '"' && !inSingle) {
      inDouble = !inDouble
      result += char
      continue
    }

    if (char === "'" && !inDouble) {
      inSingle = !inSingle
      result += char
      continue
    }

    if (!inSingle && !inDouble && char === ',') {
      let j = i + 1
      while (j < value.length && /\s/.test(value[j])) {
        j += 1
      }
      const nextChar = value[j]
      if (nextChar === '}' || nextChar === ']') {
        continue
      }
    }

    result += char
  }

  return result
}

const autoCloseStructures = (value: string): string => {
  const stack: string[] = []
  let inDouble = false
  let inSingle = false
  let escaped = false

  for (const char of value) {
    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (char === '"' && !inSingle) {
      inDouble = !inDouble
      continue
    }

    if (char === "'" && !inDouble) {
      inSingle = !inSingle
      continue
    }

    if (inSingle || inDouble) {
      continue
    }

    if (char === '{' || char === '[') {
      stack.push(char)
    } else if (char === '}' || char === ']') {
      const expected = stack[stack.length - 1]
      if ((char === '}' && expected === '{') || (char === ']' && expected === '[')) {
        stack.pop()
      }
    }
  }

  return value + stack.reverse().map((char) => (char === '{' ? '}' : ']')).join('')
}

/**
 * Attempts to repair common JSON mistakes such as missing quotes on keys or trailing semicolons.
 */
export const sanitizeJsonInput = (rawValue: string): string => {
  let value = rawValue.trim()
  if (!value) {
    return ''
  }

  value = normalizeSingleQuotedSegments(value)
  value = normalizeKeyQuotes(value)
  value = stripLooseSemicolons(value)
  value = removeTrailingCommas(value)
  value = autoCloseStructures(value)

  return value
}

export const formatMetadataValue = (value: string, attemptRepair = false): string | null => {
  if (!value.trim()) {
    return ''
  }

  const attempts = [value.trim()]

  if (attemptRepair) {
    const repaired = sanitizeJsonInput(value)
    if (repaired && repaired !== value) {
      attempts.push(repaired)
    }
  }

  for (const candidate of attempts) {
    try {
      const parsed = JSON.parse(candidate)
      return JSON.stringify(parsed, null, 2)
    } catch {
      continue
    }
  }

  return null
}

export const determineMetadataStatus = (value: string): MetadataStatus => {
  if (!value.trim()) {
    return 'idle'
  }

  try {
    JSON.parse(value)
    return 'valid'
  } catch {
    return 'invalid'
  }
}
