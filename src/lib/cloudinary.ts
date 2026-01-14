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

// Upload file to Cloudinary with optimizations
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
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary environment variables not configured. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.')
    }

    const uploadOptions = {
      folder: options.folder || 'marketdotcom/products',
      resource_type: options.resource_type || 'auto',
      ...options,
    }

    // Add image optimizations for better performance
    if (!options.transformation) {
      uploadOptions.transformation = [
        { width: 800, height: 800, crop: "limit", quality: "auto" },
        { fetch_format: "auto" }
      ]
    }

    console.log('Uploading to Cloudinary with options:', uploadOptions)
    const result = await cloudinary.uploader.upload(file, uploadOptions)
    console.log('Cloudinary upload successful:', result.public_id)

    return result
  } catch (error) {
    console.error('Cloudinary upload error:', error)
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
    return cloudinary.url(publicId, {
      secure: true,
      quality: 'auto',
      fetch_format: 'auto',
      ...options
    })
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
} {
  const requiredVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
  const missingVars = requiredVars.filter(varName => !process.env[varName])

  return {
    configured: missingVars.length === 0,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    missingVars
  }
}

export default cloudinary