// Mock Cloudinary implementation for build compatibility
// Replace with actual Cloudinary SDK once package is installed

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  url: string
  format: string
  width: number
  height: number
  bytes: number
}

// Mock Cloudinary configuration (will be replaced with real SDK)
const mockCloudinary = {
  config: () => {},
  uploader: {
    upload: async () => {
      throw new Error('Cloudinary SDK not installed. Please run: npm install cloudinary')
    },
    destroy: async () => {
      throw new Error('Cloudinary SDK not installed. Please run: npm install cloudinary')
    }
  },
  url: () => {
    throw new Error('Cloudinary SDK not installed. Please run: npm install cloudinary')
  }
}

export async function uploadToCloudinary(
  file: Buffer | string,
  options: {
    folder?: string
    public_id?: string
    transformation?: any[]
  } = {}
): Promise<CloudinaryUploadResult> {
  // For now, return a mock result to prevent build failures
  // Replace with actual Cloudinary upload once SDK is installed
  console.warn('Cloudinary SDK not installed. Using mock implementation.')

  // Generate mock result
  const mockResult: CloudinaryUploadResult = {
    public_id: `mock_${Date.now()}`,
    secure_url: `https://via.placeholder.com/400x400?text=Mock+Image`,
    url: `https://via.placeholder.com/400x400?text=Mock+Image`,
    format: 'jpg',
    width: 400,
    height: 400,
    bytes: 1024
  }

  return mockResult
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  console.warn('Cloudinary SDK not installed. Mock delete operation.')
  // Mock delete - do nothing
}

export function getCloudinaryUrl(publicId: string, options: any = {}): string {
  console.warn('Cloudinary SDK not installed. Returning placeholder URL.')
  return `https://via.placeholder.com/400x400?text=Mock+Image+${publicId}`
}

export default mockCloudinary