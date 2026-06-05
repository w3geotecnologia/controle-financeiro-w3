import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Detecta mobile no primeiro render usando window.innerWidth
  const getInitialValue = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    return false
  }

  const [isMobile, setIsMobile] = React.useState<boolean>(getInitialValue)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
