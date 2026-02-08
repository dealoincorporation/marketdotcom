import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { uploadToCloudinary, getCloudinaryStatus } from "@/lib/cloudinary"

// Force dynamic rendering to avoid static generation and Edge Runtime issues
export const dynamic = 'force-dynamic'

// Test endpoint for Cloudinary configuration
export async function GET() {
  try {
    const status = getCloudinaryStatus()

    return NextResponse.json({
      status: 'success',
      cloudinaryConfigured: status.configured,
      cloudName: status.cloudName,
      missingVars: status.missingVars,
      envCheck: status.envCheck,
      envVars: {
        CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
        CLOUDINARY_API_SECRET_LENGTH: process.env.CLOUDINARY_API_SECRET?.length || 0
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Upload request received')

    // Check authentication - only admins can upload images
    const user = getUserFromRequest(request)
    if (!user || user.role !== "ADMIN") {
      console.log('Authentication failed - user:', user)
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    console.log('User authenticated:', user.email)

    // Check Cloudinary configuration
    const cloudinaryStatus = getCloudinaryStatus()
    console.log('Cloudinary status:', cloudinaryStatus)

    // Manual environment check
    console.log('Manual env check:')
    console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'NOT SET')
    console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'NOT SET')
    console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set (length: ' + (process.env.CLOUDINARY_API_SECRET?.length || 0) + ')' : 'NOT SET')

    if (!cloudinaryStatus.configured) {
      console.log('Cloudinary not configured properly')
      return NextResponse.json(
        {
          error: "Cloudinary not configured. Please check environment variables.",
          details: cloudinaryStatus,
          envVars: {
            CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
            CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
            CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET
          }
        },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const folder = formData.get('folder') as string || 'marketdotcom/products'

    // Support both single file (backward compatibility) and multiple files
    const singleFile = formData.get('file') as File
    const multipleFiles = formData.getAll('files') as File[]

    let files: File[] = []

    if (singleFile && singleFile.size > 0) {
      files = [singleFile]
    } else if (multipleFiles && multipleFiles.length > 0) {
      files = multipleFiles.filter(file => file && file.size > 0)
    }

    console.log('Files received:', files.map(f => ({ name: f.name, size: f.size })))

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      )
    }

    // Validate files
    const validationErrors: string[] = []
    const validFiles: File[] = []

    files.forEach((file, index) => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        validationErrors.push(`File ${index + 1} (${file.name}): Only image files are allowed`)
        return
      }

      // Check file size (max 5MB per file)
      if (file.size > 5 * 1024 * 1024) {
        validationErrors.push(`File ${index + 1} (${file.name}): File size too large. Maximum 5MB allowed.`)
        return
      }

      validFiles.push(file)
    })

    if (validFiles.length === 0) {
      return NextResponse.json(
        {
          error: "No valid files to upload",
          validationErrors
        },
        { status: 400 }
      )
    }

    // Upload files concurrently
    const uploadPromises = validFiles.map(async (file, index) => {
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const result = await uploadToCloudinary(buffer, {
          folder,
          public_id: `${Date.now()}-${index}-${file.name.replace(/\.[^/.]+$/, "")}`,
          transformation: [
            { width: 800, height: 800, crop: "limit" }, // Resize to max 800x800
            { quality: "auto" } // Auto quality optimization
          ]
        })

        return {
          success: true,
          fileName: file.name,
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes
        }
      } catch (error) {
        console.error(`Upload error for ${file.name}:`, error)
        return {
          success: false,
          fileName: file.name,
          error: error instanceof Error ? error.message : 'Unknown upload error'
        }
      }
    })

    const uploadResults = await Promise.allSettled(uploadPromises)

    // Process results
    const successfulUploads: any[] = []
    const failedUploads: any[] = []

    uploadResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          successfulUploads.push(result.value)
        } else {
          failedUploads.push(result.value)
        }
      } else {
        failedUploads.push({
          success: false,
          fileName: validFiles[index]?.name || `File ${index + 1}`,
          error: result.reason?.message || 'Upload failed'
        })
      }
    })

    console.log(`Upload summary: ${successfulUploads.length} successful, ${failedUploads.length} failed`)

    return NextResponse.json({
      success: successfulUploads.length > 0,
      totalFiles: files.length,
      validFiles: validFiles.length,
      successfulUploads: successfulUploads.length,
      failedUploads: failedUploads.length,
      results: successfulUploads,
      errors: failedUploads.length > 0 ? failedUploads : undefined,
      validationErrors: validationErrors.length > 0 ? validationErrors : undefined
    })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    )
  }
}