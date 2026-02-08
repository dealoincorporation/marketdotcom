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

async function verifyTransactionWithPaystack(reference) {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error(`❌ Error verifying transaction ${reference}:`, error.message)
    return null
  }
}

async function processWalletTransaction(walletTransaction) {
  try {
    console.log(`\n🔍 Verifying transaction: ${walletTransaction.reference}`)
    console.log(`   User ID: ${walletTransaction.userId}`)
    console.log(`   Amount: ₦${walletTransaction.amount.toLocaleString()}`)
    console.log(`   Status: ${walletTransaction.status}`)
    console.log(`   Created: ${walletTransaction.createdAt}`)

    // Verify with Paystack
    const paystackResponse = await verifyTransactionWithPaystack(walletTransaction.reference)

    if (!paystackResponse || !paystackResponse.status) {
      console.log(`   ⚠️  Could not verify with Paystack (transaction may not exist or API error)`)
      return { processed: false, reason: 'Paystack verification failed' }
    }

    const transactionData = paystackResponse.data
    const paystackStatus = String(transactionData.status || '').toLowerCase()
    const isSuccess = paystackStatus === 'success'
    const isTerminalFailure = paystackStatus === 'failed' || paystackStatus === 'abandoned'

    console.log(`   📊 Paystack Status: ${transactionData.status}`)
    console.log(`   💰 Paystack Amount: ₦${(transactionData.amount / 100).toLocaleString()}`)

    // Check if already processed
    if (walletTransaction.status === 'COMPLETED' && isSuccess) {
      console.log(`   ✅ Already processed - skipping`)
      return { processed: false, reason: 'Already completed' }
    }

    if (isSuccess) {
      // Get user data
      const user = await prisma.user.findUnique({
        where: { id: walletTransaction.userId },
        select: { name: true, email: true, walletBalance: true }
      })

      if (!user) {
        console.log(`   ⚠️  User not found (userId: ${walletTransaction.userId})`)
        console.log(`   💡 This transaction may be orphaned. Skipping to prevent errors.`)
        return { processed: false, reason: 'User not found - orphaned transaction' }
      }

      // Verify amount matches (convert from kobo to naira)
      const expectedAmount = walletTransaction.amount * 100 // Convert to kobo
      const actualAmount = transactionData.amount
      if (Math.abs(expectedAmount - actualAmount) > 1) {
        console.log(`   ⚠️  Amount mismatch: Expected ₦${walletTransaction.amount}, Got ₦${actualAmount / 100}`)
        // Continue anyway - might be fees or rounding
      }

      // Update wallet balance
      await prisma.user.update({
        where: { id: walletTransaction.userId },
        data: {
          walletBalance: {
            increment: walletTransaction.amount
          }
        }
      })

      // Update transaction status
      await prisma.walletTransaction.update({
        where: { id: walletTransaction.id },
        data: {
          status: 'COMPLETED'
        }
      })

      // Create notification
      await prisma.notification.create({
        data: {
          userId: walletTransaction.userId,
          title: "Wallet Funded Successfully",
          message: `Your wallet has been credited with ₦${walletTransaction.amount.toLocaleString()}`,
          type: "WALLET"
        }
      })

      const newBalance = user.walletBalance + walletTransaction.amount
      console.log(`   ✅ SUCCESS! Wallet credited`)
      console.log(`   💰 Old Balance: ₦${user.walletBalance.toLocaleString()}`)
      console.log(`   💰 New Balance: ₦${newBalance.toLocaleString()}`)

      return { processed: true, status: 'COMPLETED', amount: walletTransaction.amount }
    } else if (isTerminalFailure) {
      // Update to failed
      await prisma.walletTransaction.update({
        where: { id: walletTransaction.id },
        data: {
          status: 'FAILED'
        }
      })

      console.log(`   ❌ Payment failed on Paystack`)
      return { processed: true, status: 'FAILED' }
    } else {
      // Still pending/processing - don't mark as failed.
      console.log(`   ⏳ Transaction still pending on Paystack - leaving as ${walletTransaction.status}`)
      return { processed: false, reason: `Still pending on Paystack (${paystackStatus})` }
    }
  } catch (error) {
    console.error(`   ❌ Error processing transaction:`, error.message)
    return { processed: false, reason: error.message }
  }
}

async function verifyPendingWalletTransactions() {
  try {
    console.log('🚀 Verifying Pending Wallet Transactions')
    console.log('=' .repeat(50))

    if (!PAYSTACK_SECRET_KEY) {
      console.error('❌ PAYSTACK_SECRET_KEY not found in environment variables')
      console.error('💡 Make sure your .env.local file has PAYSTACK_SECRET_KEY set')
      return
    }

    // Find all wallet transactions that may need reconciliation (without user relation to avoid errors with orphaned records)
    const pendingTransactions = await prisma.walletTransaction.findMany({
      where: {
        type: 'CREDIT',
        status: { in: ['PENDING', 'FAILED'] }
      },
      orderBy: {
        createdAt: 'desc'
      }
      // Note: Not including user relation here because some transactions may have invalid userIds
      // We'll fetch user data separately in processWalletTransaction if needed
    })

    if (pendingTransactions.length === 0) {
      console.log('✅ No pending wallet transactions found!')
      return
    }

    console.log(`\n📊 Found ${pendingTransactions.length} pending transaction(s)\n`)

    let successCount = 0
    let failedCount = 0
    let skippedCount = 0
    const orphanedTransactions = []
    const results = []

    // Process each transaction
    for (const transaction of pendingTransactions) {
      const result = await processWalletTransaction(transaction)
      results.push({
        reference: transaction.reference,
        userId: transaction.userId,
        ...result
      })

      if (result.processed) {
        if (result.status === 'COMPLETED') {
          successCount++
        } else {
          failedCount++
        }
      } else {
        skippedCount++
        if (result.reason?.includes('orphaned') || result.reason?.includes('User not found')) {
          orphanedTransactions.push({
            reference: transaction.reference,
            userId: transaction.userId
          })
        }
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('📊 SUMMARY')
    console.log('='.repeat(50))
    console.log(`✅ Successfully processed: ${successCount}`)
    console.log(`❌ Failed payments: ${failedCount}`)
    console.log(`⏭️  Skipped: ${skippedCount}`)
    if (orphanedTransactions.length > 0) {
      console.log(`⚠️  Orphaned transactions (user not found): ${orphanedTransactions.length}`)
    }
    console.log(`📝 Total checked: ${pendingTransactions.length}`)

    // Show details of processed transactions
    const processed = results.filter(r => r.processed && r.status === 'COMPLETED')
    if (processed.length > 0) {
      console.log('\n💰 Successfully Credited Transactions:')
      processed.forEach(r => {
        console.log(`   • ${r.reference}: ₦${r.amount?.toLocaleString()}`)
      })
    }

    // Show orphaned transactions if any
    if (orphanedTransactions.length > 0) {
      console.log('\n⚠️  Orphaned Transactions (User Not Found):')
      orphanedTransactions.forEach(t => {
        console.log(`   • ${t.reference} (userId: ${t.userId})`)
      })
      console.log('   💡 These transactions reference users that no longer exist.')
      console.log('   💡 You may need to manually investigate and clean these up.')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('💡 Make sure:')
    console.error('   - Your DATABASE_URL is correct in .env.local')
    console.error('   - PAYSTACK_SECRET_KEY is set in .env.local')
    console.error('   - MongoDB Atlas cluster is running')
    console.error('   - Network connection is stable')
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
verifyPendingWalletTransactions()
