import { z } from "zod"

// API-level validation schema for registration
export const registerApiSchema = z.object({
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  referralCode: z
    .string()
    .optional()
    .refine((val) => !val || val.trim().length >= 3, {
      message: "Referral code must be at least 3 characters if provided"
    }),
  makeAdmin: z.boolean().optional(),
})

// API-level validation schema for login
export const loginApiSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
})

export type RegisterApiData = z.infer<typeof registerApiSchema>
export type LoginApiData = z.infer<typeof loginApiSchema>
