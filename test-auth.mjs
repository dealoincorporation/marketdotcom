import { getPrismaClient } from './src/lib/prisma.js'
import bcrypt from 'bcryptjs'

async function testAuth() {
  console.log('🧪 Testing Authentication Flow')
  console.log('==============================')

  try {
    console.log('1. Connecting to database...')
    const prisma = await getPrismaClient()
    console.log('✅ Database connection successful')

    console.log('\n2. Looking up user...')
    const user = await prisma.user.findUnique({
      where: { email: 'openiyiibrahim@gmail.com' }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      hasPassword: !!user.password
    })

    console.log('\n3. Testing environment variables...')
    console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing')
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '❌ Missing')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing')
    console.log('AUTH_DEBUG:', process.env.AUTH_DEBUG || 'Not set')

    console.log('\n4. Testing password verification...')
    if (user.password) {
      // You would need to provide the actual password here
      const testPasswords = ['your_actual_password_here']
      for (const testPass of testPasswords) {
        const isValid = await bcrypt.compare(testPass, user.password)
        console.log(`Password "${testPass.substring(0, 3)}...": ${isValid ? '✅ Valid' : '❌ Invalid'}`)
      }
    }

    await prisma.$disconnect()
    console.log('\n✅ Test completed successfully')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Stack:', error.stack)
  }
}

testAuth()