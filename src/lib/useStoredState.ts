import { useEffect, useState } from 'react'

/** useState that persists to localStorage, falling back silently when storage is unavailable. */
export function useStoredState<T>(key: string, initial: () => T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw != null) return JSON.parse(raw) as T
    } catch {
      // storage blocked or corrupt — use the default
    }
    return initial()
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore quota / privacy-mode errors
    }
  }, [key, value])

  return [value, setValue] as const
}
