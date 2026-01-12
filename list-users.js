import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listUsers() {
  try {
    console.log('📋 Listing all users...\n')

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (users.length === 0) {
      console.log('No users found in the database.')
      return
    }

    console.log(`Found ${users.length} user(s):\n`)

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No name'} (${user.email})`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Email Verified: ${user.emailVerified ? '✅' : '❌'}`)
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`)
      console.log(`   User ID: ${user.id}\n`)
    })

    console.log('💡 To make a user admin, run:')
    console.log('   node make-admin.js user@example.com')

  } catch (error) {
    console.error('❌ Error listing users:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()