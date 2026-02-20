// Application constants and configuration

// Get base URL based on environment
function getBaseAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  // Use localhost in development, production domain in production
  return process.env.NODE_ENV === 'production' 
    ? 'https://marketdotcom.ng' 
    : 'http://localhost:3000'
}

export const APP_CONFIG = {
  name: 'Marketdotcom',
  description: 'Quality foodstuff, daily savings, and convenient delivery—all in one place.',
  url: getBaseAppUrl(),
  supportEmail: 'marketdotcominfo@gmail.com',
  adminEmail: 'marketdotcominfo@gmail.com',
  supportPhone: '+234 813 835 3576',
} as const

export const API_ROUTES = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    session: '/api/auth/session',
    verifyEmail: '/api/auth/verify-email',
    resendVerification: '/api/auth/resend-verification',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
  },
  products: '/api/products',
  categories: '/api/categories',
  orders: '/api/orders',
  cart: '/api/cart',
  wallet: '/api/wallet',
  notifications: '/api/notifications',
} as const

export const ROUTES = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
  verifyEmail: '/auth/verify-email',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  dashboard: '/dashboard',
  marketplace: '/marketplace',
  cart: '/cart',
  checkout: '/checkout',
  orders: '/orders',
  wallet: '/wallet',
  profile: '/profile',
  terms: '/terms',
} as const

export const COLORS = {
  primary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const

export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const

export const VALIDATION = {
  password: {
    minLength: 6,
    maxLength: 128,
  },
  phone: {
    minLength: 10,
    maxLength: 15,
  },
  name: {
    minLength: 2,
    maxLength: 100,
  },
  product: {
    name: {
      minLength: 2,
      maxLength: 200,
    },
    description: {
      maxLength: 1000,
    },
    price: {
      min: 0,
      max: 999999,
    },
    stock: {
      min: 0,
      max: 99999,
    },
  },
} as const

export const EMAIL_CONFIG = {
  verificationCodeExpiry: 10 * 60 * 1000, // 10 minutes
  resetTokenExpiry: 1 * 60 * 60 * 1000, // 1 hour
} as const

export const CART_CONFIG = {
  maxItems: 99,
  defaultQuantity: 1,
} as const

export const WALLET_CONFIG = {
  minimumTopUp: 100,
  maximumTopUp: 50000,
  pointsPerNaira: 0.1,
  nairaPerPoint: 10,
  minimumPointsToConvert: 100,
} as const

export const DELIVERY_CONFIG = {
  fee: 500,
  freeDeliveryThreshold: 5000,
  estimatedTime: {
    min: 30,
    max: 120,
  },
} as const

export const ORDER_CONFIG = {
  maxItems: 50,
  cancellationWindow: 30, // minutes
} as const

export const NOTIFICATION_CONFIG = {
  maxPerPage: 20,
  retentionDays: 90,
} as const

/** Hero / promotional slider images (home hero + auth panel) */
export const HERO_IMAGES = [
  "/hero/hero-image_one.jpeg",
  "/hero/hero-image_two.jpeg",
  "/hero/hero-image_three.jpeg",
  "/hero/hero-image_four.jpeg",
  "/hero/hero-image_five.jpeg",
  "/hero/hero-image_six.jpeg",
] as const