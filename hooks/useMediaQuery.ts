'use client'

import { useEffect, useState } from 'react'

/**
 * Hook para detectar media queries de manera responsive
 * @param query - Media query string (ej: '(min-width: 768px)')
 * @returns boolean indicando si la media query coincide
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Soporte para navegadores modernos y legacy
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
    } else {
      // Fallback para navegadores antiguos
      mediaQuery.addListener(handler)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler)
      } else {
        mediaQuery.removeListener(handler)
      }
    }
  }, [query])

  // Evitar hydration mismatch
  if (!mounted) {
    return false
  }

  return matches
}

/**
 * Hook para detectar si estamos en dispositivo móvil (< 768px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}

/**
 * Hook para detectar si es un dispositivo táctil
 */
export function useIsTouchDevice(): boolean {
  return useMediaQuery('(pointer: coarse)')
}
