# Codebase Modularization Plan

## Overview
This document outlines the modularization strategy for the Marketdotcom codebase to improve maintainability, reusability, and scalability.

## Current State Analysis

### Largest Files (Lines of Code)
1. `src/app/checkout/page.tsx` - 1,660 lines
2. `src/lib/email.ts` - 1,362 lines
3. `src/app/page.tsx` - 1,309 lines
4. `src/components/forms/product-form.tsx` - 1,090 lines
5. `src/app/dashboard/components/AdminTab.tsx` - 862 lines
6. `src/app/dashboard/components/ManageProductsTab.tsx` - 840 lines
7. `src/app/dashboard/components/WalletTab.tsx` - 737 lines

## Modularization Strategy

### 1. Product Form Modularization ✅ (In Progress)
**Location**: `src/components/forms/product-form/`

**Components Created**:
- `types.ts` - Shared TypeScript interfaces
- `ProductImageUpload.tsx` - Image upload component
- `ProductBasicInfo.tsx` - Basic product information form
- `ProductVariationsSection.tsx` - Variations management (to be created)
- `ProductFormHeader.tsx` - Form header component (to be created)
- `hooks/useProductForm.ts` - Form state management hook (to be created)

**Benefits**:
- Reusable image upload component
- Easier to test individual sections
- Better code organization
- Reduced file size (1090 → ~200 lines per component)

### 2. Checkout Page Modularization (Next)
**Location**: `src/app/checkout/components/`

**Proposed Components**:
- `CheckoutHeader.tsx` - Page header
- `CheckoutForm.tsx` - Main form wrapper
- `DeliveryAddressSection.tsx` - Address selection
- `PaymentMethodSection.tsx` - Payment options
- `OrderSummary.tsx` - Order review
- `CheckoutActions.tsx` - Submit buttons
- `hooks/useCheckout.ts` - Checkout logic

### 3. Homepage Modularization (Next)
**Location**: `src/components/home/`

**Proposed Components**:
- `HeroSection.tsx` - Hero banner
- `FeaturesSection.tsx` - Features grid
- `TestimonialsSection.tsx` - Testimonials carousel
- `ProductShowcase.tsx` - Featured products
- `CTA Section.tsx` - Call to action

### 4. Email Service Modularization (Next)
**Location**: `src/lib/email/`

**Proposed Structure**:
- `email-client.ts` - Email client setup
- `templates/` - Email templates
  - `verification.ts`
  - `password-reset.ts`
  - `order-confirmation.ts`
- `senders/` - Email sending functions
  - `verification.ts`
  - `password-reset.ts`
  - `order.ts`
- `types.ts` - Email-related types

### 5. Dashboard Tabs Modularization (Next)
**Location**: `src/app/dashboard/components/[tab-name]/`

**Proposed Structure**:
- Each tab broken into smaller sub-components
- Shared components in `src/app/dashboard/components/shared/`
- Custom hooks in `src/app/dashboard/hooks/`

### 6. Shared Utilities Organization
**Location**: `src/lib/utils/`

**Proposed Structure**:
- `validation.ts` - Form validation utilities
- `formatting.ts` - Formatting helpers (currency, dates, etc.)
- `api-helpers.ts` - API request/response helpers
- `constants.ts` - App-wide constants
- `errors.ts` - Error handling utilities

### 7. Type Organization
**Location**: `src/types/`

**Proposed Structure**:
- `product.ts` - Product-related types
- `order.ts` - Order-related types
- `user.ts` - User-related types
- `api.ts` - API response types
- `common.ts` - Common/shared types

### 8. API Routes Organization
**Location**: `src/app/api/`

**Proposed Improvements**:
- Shared middleware in `src/app/api/middleware/`
- Shared validation in `src/app/api/validators/`
- Shared response helpers in `src/app/api/helpers/`

## Implementation Priority

1. ✅ **Product Form** - Started
2. **Shared Utilities** - High priority (affects all files)
3. **Type Organization** - High priority (affects all files)
4. **Checkout Page** - Medium priority
5. **Homepage** - Medium priority
6. **Email Service** - Medium priority
7. **Dashboard Tabs** - Lower priority (already somewhat modular)

## Benefits of Modularization

1. **Maintainability**: Easier to find and fix bugs
2. **Reusability**: Components can be reused across the app
3. **Testability**: Smaller units are easier to test
4. **Performance**: Better code splitting and lazy loading
5. **Developer Experience**: Easier onboarding and collaboration
6. **Scalability**: Easier to add new features

## File Structure After Modularization

```
src/
├── components/
│   ├── forms/
│   │   └── product-form/
│   │       ├── index.tsx (main form)
│   │       ├── types.ts
│   │       ├── ProductImageUpload.tsx
│   │       ├── ProductBasicInfo.tsx
│   │       ├── ProductVariationsSection.tsx
│   │       └── hooks/
│   │           └── useProductForm.ts
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   └── ...
│   └── ...
├── lib/
│   ├── utils/
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   └── ...
│   ├── email/
│   │   ├── email-client.ts
│   │   ├── templates/
│   │   └── senders/
│   └── ...
├── types/
│   ├── product.ts
│   ├── order.ts
│   └── ...
└── ...
```

## Next Steps

1. Complete Product Form modularization
2. Create shared utilities structure
3. Organize types
4. Modularize checkout page
5. Modularize homepage
6. Modularize email service
7. Refactor dashboard tabs
