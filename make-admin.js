import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser(email, name = 'Admin User', phone = '+2340000000000', password = 'Admin123!') {
  try {
    console.log(`🔍 Checking if admin user already exists...`)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      if (existingUser.role === 'ADMIN') {
        console.log(`✅ Admin user already exists: ${existingUser.name || existingUser.email}`)
        console.log(`🆔 User ID: ${existingUser.id}`)
        console.log(`👤 Role: ${existingUser.role}`)
        return
      } else {
        console.log(`🔄 Upgrading existing user to admin...`)
        const user = await prisma.user.update({
          where: { email },
          data: { role: 'ADMIN' }
        })
        console.log(`✅ Success! User ${user.name || user.email} is now an admin.`)
        return
      }
    }

    console.log(`📝 Creating new admin user...`)

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user (pre-verified)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'ADMIN',
        referralCode: Math.random().toString(36).substring(2, 15),
        emailVerified: new Date(), // Mark as verified
        walletBalance: 1000, // Give admin some starting balance
      }
    })

    console.log(`✅ Success! Admin user created.`)
    console.log(`👤 Name: ${user.name}`)
    console.log(`📧 Email: ${user.email}`)
    console.log(`📞 Phone: ${user.phone}`)
    console.log(`🆔 User ID: ${user.id}`)
    console.log(`👑 Role: ${user.role}`)
    console.log(`💰 Wallet Balance: ₦${user.walletBalance}`)
    console.log(`🔑 Password: ${password} (change this after first login!)`)

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message)
    console.error('💡 Make sure:')
    console.error('   - Your DATABASE_URL is correct in .env.local')
    console.error('   - MongoDB Atlas cluster is running')
    console.error('   - Network connection is stable')
  } finally {
    await prisma.$disconnect()
  }
}

// Usage: node make-admin.js [email] [name] [phone]
const email = process.argv[2] || 'marketdotcominfo@gmail.com'
const name = process.argv[3] || 'MarketDotCom Admin'
const phone = process.argv[4] || '+2340000000000'

console.log('🚀 Creating Admin User')
console.log('📧 Email:', email)
console.log('👤 Name:', name)
console.log('📞 Phone:', phone)
console.log('')

createAdminUser(email, name, phone)