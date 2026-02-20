'use client'

import { useState, useEffect } from 'react'

// Hook for managing localStorage with SSR safety
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Save state
      setStoredValue(valueToStore)

      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error)
    }
  }

  // Initialize on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key)
        if (item !== null) {
          setStoredValue(JSON.parse(item))
        }
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
    }
    setIsHydrated(true)
  }, [key])

  // Return the stored value and setter, but only return the stored value after hydration
  return [isHydrated ? storedValue : initialValue, setValue]
}

// Hook for managing sessionStorage
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error saving to sessionStorage key "${key}":`, error)
    }
  }

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.sessionStorage.getItem(key)
        if (item !== null) {
          setStoredValue(JSON.parse(item))
        }
      }
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error)
    }
    setIsHydrated(true)
  }, [key])

  return [isHydrated ? storedValue : initialValue, setValue]
}

// Hook for managing form state with localStorage persistence
export function useFormStorage<T extends Record<string, any>>(
  key: string,
  initialValues: T
): [T, (field: keyof T, value: any) => void, () => void, () => void] {
  const [formData, setFormData] = useLocalStorage(key, initialValues)

  const updateField = (field: keyof T, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setFormData(initialValues)
  }

  const clearForm = () => {
    setFormData({} as T)
  }

  return [formData, updateField, resetForm, clearForm]
}