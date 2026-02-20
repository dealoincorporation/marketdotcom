#!/usr/bin/env node
/**
 * Wallet Funding Setup Verification Script
 * 
 * This script helps verify that wallet funding is properly configured:
 * 1. Checks environment variables
 * 2. Tests database connection
 * 3. Verifies Paystack API connectivity
 * 4. Checks for pending/failed transactions that need reconciliation
 * 5. Provides webhook configuration instructions
 */

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '.env.local') })

const prisma = new PrismaClient()

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE_URL = 'https://api.paystack.co'
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL
const NODE_ENV = process.env.NODE_ENV || 'development'

async function checkEnvironmentVariables() {
  console.log('\n📋 Checking Environment Variables')
  console.log('='.repeat(60))
  
  const checks = {
    'PAYSTACK_SECRET_KEY': !!PAYSTACK_SECRET_KEY,
    'NEXT_PUBLIC_APP_URL or NEXTAUTH_URL': !!NEXT_PUBLIC_APP_URL,
    'DATABASE_URL': !!process.env.DATABASE_URL,
  }
  
  let allPassed = true
  for (const [key, passed] of Object.entries(checks)) {
    const status = passed ? '✅' : '❌'
    console.log(`${status} ${key}: ${passed ? 'Set' : 'MISSING'}`)
    if (!passed) allPassed = false
  }
  
  if (PAYSTACK_SECRET_KEY) {
    const isTest = PAYSTACK_SECRET_KEY.startsWith('sk_test_')
    const isLive = PAYSTACK_SECRET_KEY.startsWith('sk_live_')
    console.log(`\n   Key Type: ${isTest ? '🧪 TEST' : isLive ? '🚀 LIVE' : '⚠️  UNKNOWN'}`)
  }
  
  if (NEXT_PUBLIC_APP_URL) {
    const isLocalhost = NEXT_PUBLIC_APP_URL.includes('localhost')
    const isProduction = NODE_ENV === 'production'
    
    if (isProduction && isLocalhost) {
      console.log(`\n   ⚠️  WARNING: Production mode but URL is localhost!`)
      console.log(`   💡 This will cause redirect issues. Set NEXT_PUBLIC_APP_URL to your production domain.`)
    } else if (!isProduction && isLocalhost) {
      console.log(`\n   ✅ Development mode with localhost - OK`)
    } else {
      console.log(`\n   ✅ Production URL configured: ${NEXT_PUBLIC_APP_URL}`)
    }
  }
  
  return allPassed
}

async function checkDatabaseConnection() {
  console.log('\n🗄️  Checking Database Connection')
  console.log('='.repeat(60))
  
  try {
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Check for wallet transactions
    const pendingCount = await prisma.walletTransaction.count({
      where: {
        type: 'CREDIT',
        status: 'PENDING'
      }
    })
    
    const failedCount = await prisma.walletTransaction.count({
      where: {
        type: 'CREDIT',
        status: 'FAILED'
      }
    })
    
    const completedCount = await prisma.walletTransaction.count({
      where: {
        type: 'CREDIT',
        status: 'COMPLETED'
      }
    })
    
    console.log(`\n📊 Wallet Transaction Stats:`)
    console.log(`   PENDING: ${pendingCount}`)
    console.log(`   FAILED: ${failedCount}`)
    console.log(`   COMPLETED: ${completedCount}`)
    
    if (pendingCount > 0 || failedCount > 0) {
      console.log(`\n   💡 Run 'npm run verify-wallet' to reconcile pending/failed transactions`)
    }
    
    return true
  } catch (error) {
    console.log(`❌ Database connection failed: ${error.message}`)
    return false
  }
}

async function checkPaystackAPI() {
  console.log('\n🔌 Checking Paystack API Connectivity')
  console.log('='.repeat(60))
  
  if (!PAYSTACK_SECRET_KEY) {
    console.log('❌ PAYSTACK_SECRET_KEY not set - cannot test API')
    return false
  }
  
  try {
    // Test with a simple API call (get banks list or verify a dummy reference)
    const response = await fetch(`${PAYSTACK_BASE_URL}/bank`, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    })
    
    const result = await response.json()
    
    if (result.status) {
      console.log('✅ Paystack API connection successful')
      return true
    } else {
      console.log(`❌ Paystack API error: ${result.message}`)
      return false
    }
  } catch (error) {
    console.log(`❌ Paystack API connection failed: ${error.message}`)
    return false
  }
}

function printWebhookInstructions() {
  console.log('\n🔗 Webhook Configuration Instructions')
  console.log('='.repeat(60))
  
  const webhookUrl = NEXT_PUBLIC_APP_URL 
    ? `${NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/api/payments/webhook`
    : 'https://YOUR_DOMAIN/api/payments/webhook'
  
  console.log('\n📝 Steps to configure Paystack webhook:')
  console.log('\n1. Log into Paystack Dashboard: https://dashboard.paystack.com/')
  console.log('2. Go to Settings → API Keys & Webhooks')
  console.log('3. Click "Add Webhook URL"')
  console.log(`4. Enter this URL: ${webhookUrl}`)
  console.log('5. Select these events:')
  console.log('   ✅ charge.success')
  console.log('   ✅ charge.failed')
  console.log('6. Click "Save"')
  
  console.log('\n🧪 To test webhook:')
  console.log('1. Go to Paystack Dashboard → Developers → Webhooks')
  console.log('2. Click "Send Test Event" next to your webhook')
  console.log('3. Select "charge.success" event')
  console.log('4. Check your server logs for webhook receipt')
  
  console.log('\n⚠️  Important:')
  console.log('   - Webhook must be HTTPS in production (not http://localhost)')
  console.log('   - Paystack will retry failed webhooks automatically')
  console.log('   - Check webhook logs in Paystack dashboard for delivery status')
}

async function checkRecentTransactions() {
  console.log('\n📜 Recent Wallet Transactions (Last 10)')
  console.log('='.repeat(60))
  
  try {
    const recentTransactions = await prisma.walletTransaction.findMany({
      where: {
        type: 'CREDIT'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      select: {
        reference: true,
        amount: true,
        status: true,
        method: true,
        createdAt: true,
        userId: true
      }
    })
    
    if (recentTransactions.length === 0) {
      console.log('No wallet transactions found')
      return
    }
    
    console.log('\nReference                    | Amount    | Status    | Method | Created')
    console.log('-'.repeat(80))
    
    for (const tx of recentTransactions) {
      const statusIcon = tx.status === 'COMPLETED' ? '✅' : 
                        tx.status === 'FAILED' ? '❌' : '⏳'
      const ref = tx.reference.substring(0, 24).padEnd(24)
      const amount = `₦${tx.amount.toLocaleString()}`.padEnd(10)
      const status = `${statusIcon} ${tx.status}`.padEnd(10)
      const method = (tx.method || 'N/A').padEnd(8)
      const date = new Date(tx.createdAt).toLocaleDateString()
      
      console.log(`${ref} | ${amount} | ${status} | ${method} | ${date}`)
    }
    
    const needsReconciliation = recentTransactions.filter(
      tx => tx.status === 'PENDING' || tx.status === 'FAILED'
    )
    
    if (needsReconciliation.length > 0) {
      console.log(`\n💡 Found ${needsReconciliation.length} transaction(s) that may need reconciliation`)
      console.log(`   Run: npm run verify-wallet`)
    }
    
  } catch (error) {
    console.log(`❌ Error fetching transactions: ${error.message}`)
  }
}

async function main() {
  console.log('\n🔍 Wallet Funding Setup Verification')
  console.log('='.repeat(60))
  console.log(`Environment: ${NODE_ENV}`)
  console.log(`Timestamp: ${new Date().toISOString()}`)
  
  const results = {
    env: await checkEnvironmentVariables(),
    database: await checkDatabaseConnection(),
    paystack: await checkPaystackAPI(),
  }
  
  await checkRecentTransactions()
  printWebhookInstructions()
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 Summary')
  console.log('='.repeat(60))
  
  const allPassed = Object.values(results).every(r => r)
  
  if (allPassed) {
    console.log('✅ All checks passed!')
    console.log('\n💡 Next steps:')
    console.log('   1. Ensure webhook is configured in Paystack dashboard')
    console.log('   2. Test a small wallet deposit')
    console.log('   3. Monitor webhook logs in Paystack dashboard')
  } else {
    console.log('⚠️  Some checks failed. Please fix the issues above.')
  }
  
  console.log('\n')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
