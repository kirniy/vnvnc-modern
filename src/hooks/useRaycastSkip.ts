import { useEffect } from 'react'

export function useRaycastSkip(active: boolean) {
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (active) {
      document.body.setAttribute('data-no-raycast-bg', '1')
      return () => {
        document.body.removeAttribute('data-no-raycast-bg')
      }
    }
  }, [active])
}
