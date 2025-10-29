'use client'

import { useEffect } from 'react'

export function ConsoleWarningFilter() {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return

    const originalError = console.error
    
    console.error = (...args: unknown[]) => {
      try {
        // Filter out specific DOM property warnings from Privy SVGs
        if (args.length > 0 && typeof args[0] === 'string') {
          const message = args[0]
          if (
            message.includes('Invalid DOM property') && 
            message.includes('fill-rule') &&
            message.includes('fillRule')
          ) {
            // Log a cleaner message instead
            console.warn(
              '⚠️  Privy SVG DOM Warning: Using fill-rule instead of fillRule. This is a known issue with Privy\'s internal SVG components and does not affect functionality.'
            )
            return
          }
        }
        // Safely call the original error function
        originalError.apply(console, args)
      } catch (error) {
        // Fallback if there's an issue with the console override
        originalError('Console filter error:', error)
        originalError.apply(console, args)
      }
    }

    return () => {
      console.error = originalError
    }
  }, [])

  return null
}