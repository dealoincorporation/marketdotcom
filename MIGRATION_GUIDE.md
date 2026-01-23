# Migration Guide - Using Modularized Code

## Quick Start

### 1. Product Form
The product form is now modularized. The import path remains the same:

```typescript
import { ProductForm } from '@/components/forms/product-form'
```

**New Structure Available**:
```typescript
// Import individual components if needed
import { ProductImageUpload } from '@/components/forms/product-form/ProductImageUpload'
import { ProductBasicInfo } from '@/components/forms/product-form/ProductBasicInfo'
import { ProductVariationsSection } from '@/components/forms/product-form/ProductVariationsSection'
import { useProductForm } from '@/components/forms/product-form/hooks/useProductForm'
```

### 2. Using New Utilities

#### Formatting
```typescript
import { formatCurrency, formatDate, formatDateTime, formatRelativeTime } from '@/lib/utils/formatting'

// Usage
formatCurrency(70000) // "₦70,000.00"
formatDate(new Date()) // "January 23, 2025"
formatRelativeTime(new Date()) // "2 hours ago"
```

#### Validation
```typescript
import { validateEmail, validatePhone, validateRequired, validateFileSize } from '@/lib/utils/validation'

// Usage
if (!validateEmail(email)) {
  // Handle invalid email
}

const error = validateRequired(value, 'Product Name')
if (error) {
  // Show error
}
```

#### API Helpers
```typescript
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/utils/api-helpers'

// In API routes
return NextResponse.json(createSuccessResponse(data, 'Product created successfully'))

// Error handling
try {
  // ...
} catch (error) {
  const apiError = handleApiError(error)
  return NextResponse.json(createErrorResponse(apiError.error), { status: 500 })
}
```

### 3. Using New Types

```typescript
// Import from centralized types
import { Product, ProductVariation } from '@/types/product'
import { Order, OrderStatus } from '@/types/order'
import { User, UserRole } from '@/types/user'
import { ApiResponse, PaginatedResponse } from '@/types/api'

// Or import all
import { Product, Order, User, ApiResponse } from '@/types'
```

## Migration Checklist

- [ ] Update imports to use new utility functions
- [ ] Replace inline type definitions with centralized types
- [ ] Use new validation utilities instead of custom validation
- [ ] Use new formatting utilities for consistent display
- [ ] Update API routes to use new API helpers

## Benefits

1. **Consistency**: All formatting and validation is centralized
2. **Maintainability**: Changes in one place affect the whole app
3. **Type Safety**: Better TypeScript support with organized types
4. **Reusability**: Components and utilities can be reused easily
5. **Testing**: Smaller units are easier to test
