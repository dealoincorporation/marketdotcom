import jwt, { type Secret, type SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
type ExpiresIn = SignOptions['expiresIn']

export interface JWTPayload {
  userId: string
  email: string
  role: string
  type?: 'access' | 'refresh'
}

export function generateToken(payload: JWTPayload, expiresIn: ExpiresIn = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded as JWTPayload
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export function generateRefreshToken(payload: Omit<JWTPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'refresh' }, JWT_SECRET, { expiresIn: '30d' })
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function getUserFromRequest(req: Request): JWTPayload | null {
  const authHeader = req.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}