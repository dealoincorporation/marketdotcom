'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
  emailVerified?: boolean
}

interface AuthContextType {
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  token: string | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window === 'undefined') return

      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        setIsLoading(false)
        return
      }

      if (storedToken) {
        await fetchUserData(storedToken)
      }

      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const fetchUserData = async (accessToken: string) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setToken(null)
          setUser(null)
          return
        }

        localStorage.removeItem('token')
        setToken(null)
        return
      }

      const data = await response.json()
      const userData = data.user || data.data?.user

      if (!userData) {
        localStorage.removeItem('token')
        setToken(null)
        return
      }

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error: any) {
      console.error('Failed to fetch user data:', error)
      if (error?.name === 'AbortError') console.error('Request timed out')
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
      setToken(null)
    }
  }

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rememberMe }),
    })

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('Non-JSON response:', text.substring(0, 200))
      throw new Error('Server returned an invalid response. Please try again.')
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    const { user: userData, token: userToken } = data.data

    setUser(userData)
    setToken(userToken)

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', userToken)
      localStorage.setItem('user', JSON.stringify(userData))
      if (rememberMe) localStorage.setItem('rememberMe', 'true')
      else localStorage.removeItem('rememberMe')
    }
  }

  const register = async (registerData: any) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
    }

    const { user: userData, token: userToken } = data.data

    setUser(userData)
    setToken(userToken)

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', userToken)
      localStorage.setItem('user', JSON.stringify(userData))
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('rememberMe')
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}