import { useState } from 'react'
import { storage } from './storage'

// 读写 localStorage 的 hook：mount 时读取，增删改后立即写回
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => storage.get(key, defaultValue))

  const setAndSave = (newValue: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved =
        typeof newValue === 'function'
          ? (newValue as (prev: T) => T)(prev)
          : newValue
      storage.set(key, resolved)
      return resolved
    })
  }

  return [value, setAndSave] as const
}
