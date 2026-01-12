'use client'

import { useState, useEffect } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User } from '@prisma/client'
import { ROUTES } from '@/lib/constants'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const isAuthenticated = status === 'authenticated'
  const user = session?.user as User | null

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      router.push(ROUTES.dashboard)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      // Clear remembered credentials on logout
      localStorage.removeItem("rememberedEmail")
      localStorage.removeItem("rememberedPassword")

      await signOut({ callbackUrl: ROUTES.home })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: {
    name: string
    email: string
    phone: string
    password: string
  }) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed')
      }

      router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const verifyEmail = async (email: string, code: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Verification failed')
      }

      return result
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const resendVerification = async (email: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to resend verification')
      }

      return result
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const forgotPassword = async (email: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send reset email')
      }

      return result
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (token: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Password reset failed')
      }

      return result
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    isLoading: isLoading || status === 'loading',
    isAuthenticated,
    login,
    logout,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
  }
}