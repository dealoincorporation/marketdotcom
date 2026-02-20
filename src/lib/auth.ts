import jwt, { type SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

type ExpiresIn = SignOptions['expiresIn']

export interface JWTPayload {
  userId: string
  email: string
  role: string
  type?: 'access' | 'refresh'
}

export function generateToken(payload: JWTPayload, expiresIn: ExpiresIn = '7d'): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
  return jwt.sign(payload, secret, { expiresIn })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    const decoded = jwt.verify(token, secret)
    return decoded as JWTPayload
  } catch (error) {
    // Log only in dev; "invalid signature" usually means token was signed with a different JWT_SECRET (e.g. after env change) — user should log in again
    if (process.env.NODE_ENV === 'development') {
      console.warn('Token verification failed (log out and log in again if you changed JWT_SECRET):', (error as Error)?.message)
    }
    return null
  }
}

export function generateRefreshToken(payload: Omit<JWTPayload, 'type'>): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
  return jwt.sign({ ...payload, type: 'refresh' }, secret, { expiresIn: '30d' })
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function getUserFromRequest(req: any): JWTPayload | null {
  const authHeader = req.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}
