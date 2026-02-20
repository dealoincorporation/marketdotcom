// Real Cloudinary implementation
// Make sure to run: npm install cloudinary

import { v2 as cloudinary } from 'cloudinary'

// Cloudinary configuration using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  url: string
  format: string
  width: number
  height: number
  bytes: number
  created_at?: string
  resource_type?: string
}

// Upload using Cloudinary SDK (handles signatures automatically)
export async function uploadToCloudinary(
  file: Buffer | string,
  options: {
    folder?: string
    public_id?: string
    transformation?: any[]
    resource_type?: string
  } = {}
): Promise<CloudinaryUploadResult> {
  try {
    // Validate environment variables
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary environment variables not configured. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.')
    }

    console.log('Cloudinary config check - Cloud Name:', cloudName ? 'Set' : 'Missing')
    console.log('Cloudinary config check - API Key:', apiKey ? 'Set' : 'Missing')
    console.log('Cloudinary config check - API Secret:', apiSecret ? 'Set (length: ' + apiSecret.length + ')' : 'Missing')

    // Debug: Show first few characters of credentials (without exposing secrets)
    console.log('Cloud Name starts with:', cloudName?.substring(0, 3))
    console.log('API Key starts with:', apiKey?.substring(0, 3))
    console.log('API Secret starts with:', apiSecret?.substring(0, 3))

    console.log('Uploading to Cloudinary using SDK...')

    // Try basic upload options without complex parameters
    const uploadOptions: any = {
      folder: options.folder || 'marketdotcom/products'
    }

    if (options.public_id) {
      uploadOptions.public_id = options.public_id
    }

    // Handle different file types
    let uploadResult
    try {
      if (Buffer.isBuffer(file)) {
        // For Buffer, try using upload_stream (more reliable for buffers)
        console.log('Uploading buffer using upload_stream...')
        uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error) reject(error)
            else resolve(result)
          })
          // Create a readable stream from buffer
          const { Readable } = require('stream')
          const readableStream = Readable.from(file)
          readableStream.pipe(stream)
        })
      } else if (typeof file === 'string') {
        // For string (URL or base64), use directly
        console.log('Uploading string directly...')
        uploadResult = await cloudinary.uploader.upload(file, uploadOptions)
      } else {
        throw new Error('Invalid file format')
      }
    } catch (uploadError: any) {
      console.error('Detailed Cloudinary SDK error:', uploadError)
      console.error('Error message:', uploadError.message)
      console.error('Error code:', uploadError.http_code)
      throw uploadError
    }

    console.log('Cloudinary upload successful:', (uploadResult as any).public_id)

    return {
      public_id: (uploadResult as any).public_id,
      secure_url: (uploadResult as any).secure_url,
      url: (uploadResult as any).url,
      format: (uploadResult as any).format,
      width: (uploadResult as any).width,
      height: (uploadResult as any).height,
      bytes: (uploadResult as any).bytes,
      created_at: (uploadResult as any).created_at,
      resource_type: (uploadResult as any).resource_type
    }

  } catch (error) {
    console.error('Cloudinary upload error:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')

    throw new Error(`Failed to upload image to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Delete file from Cloudinary
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary environment variables not configured.')
    }

    console.log('Deleting from Cloudinary:', publicId)
    const result = await cloudinary.uploader.destroy(publicId)
    console.log('Cloudinary delete result:', result)

    if (result.result !== 'ok') {
      throw new Error(`Failed to delete image: ${result.result}`)
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error(`Failed to delete image from Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Generate Cloudinary URL with transformations
export function getCloudinaryUrl(publicId: string, options: any = {}): string {
  try {
    // Build URL manually to ensure transformations work
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    if (!cloudName) {
      throw new Error('Cloudinary cloud name not configured')
    }

    // Default transformations for optimization
    const defaultTransforms = 'w_800,h_800,c_limit,q_auto,f_auto'
    const transformations = options.transformation || defaultTransforms

    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`
    const fullUrl = `${baseUrl}/${transformations}/${publicId}`

    console.log('Generated Cloudinary URL:', fullUrl)
    return fullUrl
  } catch (error) {
    console.error('Cloudinary URL generation error:', error)
    return `https://via.placeholder.com/400x400?text=Error+Loading+Image`
  }
}

// Get Cloudinary configuration status
export function getCloudinaryStatus(): {
  configured: boolean
  cloudName?: string
  missingVars: string[]
  envCheck: Record<string, boolean>
} {
  const requiredVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
  const missingVars = requiredVars.filter(varName => !process.env[varName])

  const envCheck = {
    CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
  }

  console.log('Cloudinary Environment Check:', {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'Set (length: ' + (process.env.CLOUDINARY_API_SECRET?.length || 0) + ')' : 'Missing',
  })

  return {
    configured: missingVars.length === 0,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    missingVars,
    envCheck
  }
}

export default cloudinary