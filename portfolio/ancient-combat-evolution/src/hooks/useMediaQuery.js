import { useEffect, useState } from 'react'

// Subscribe to a media query and re-render on change. SSR-safe.
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (e) => setMatches(e.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export const useIsDesktop = () => useMediaQuery('(min-width: 768px) and (pointer: fine)')
export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
