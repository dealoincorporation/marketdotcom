// Simple test script to check Cloudinary configuration
import dotenv from 'dotenv'
import crypto from 'crypto'
import { readFileSync } from 'fs'

dotenv.config({ path: '.env.local' })

console.log('Testing Cloudinary Configuration:')
console.log('================================')
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Missing')
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing')
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✓ Set (length: ' + process.env.CLOUDINARY_API_SECRET.length + ')' : '✗ Missing')

if (process.env.CLOUDINARY_API_SECRET) {
  // Test signature generation with the same parameters from the error
  const testParams = {
    timestamp: '1768563215',
    folder: 'marketdotcom/products',
    public_id: '1768563215847-cart_image'
  }

  const sortedKeys = Object.keys(testParams).sort()
  const signatureString = sortedKeys
    .map(key => `${key}=${encodeURIComponent(testParams[key])}`)
    .join('&') + process.env.CLOUDINARY_API_SECRET

  const signature = crypto.createHash('sha1').update(signatureString).digest('hex')

  console.log('\nTest Signature Generation (matching error params):')
  console.log('Parameters:', testParams)
  console.log('Expected signature from error: 75b3759191d34735652fcd66a97ebaf7205253cb')
  console.log('Generated signature:', signature)
  console.log('Match:', signature === '75b3759191d34735652fcd66a97ebaf7205253cb' ? '✓ YES' : '✗ NO')
}

console.log('\nConfiguration check complete.')