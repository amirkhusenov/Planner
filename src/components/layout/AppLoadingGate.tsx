import { useEffect, useState, type ReactNode } from 'react'
import LoadingScreen from './LoadingScreen'

interface AppLoadingGateProps {
  children: ReactNode
}

export default function AppLoadingGate({ children }: AppLoadingGateProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingPhase, setLoadingPhase] = useState<'enter' | 'exit'>('enter')

  useEffect(() => {
    const durationMs = 1900
    const fadeOutMs = 360
    const startedAt = performance.now()
    let frameId = 0

    const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3)

    const tick = (now: number) => {
      const elapsed = now - startedAt
      const normalized = Math.min(1, elapsed / durationMs)
      const eased = easeOutCubic(normalized)
      setLoadingProgress(Math.min(100, Math.round(eased * 100)))

      if (normalized < 1) {
        frameId = window.requestAnimationFrame(tick)
        return
      }

      setLoadingProgress(100)
      setLoadingPhase('exit')

      window.setTimeout(() => {
        setIsLoading(false)
      }, fadeOutMs)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  if (isLoading) {
    return <LoadingScreen progress={loadingProgress} phase={loadingPhase} />
  }

  return <>{children}</>
}
