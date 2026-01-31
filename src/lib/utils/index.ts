/**
 * Central utils barrel: classnames, formatting, validation, API helpers
 */
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export * from "./formatting"
export * from "./validation"
export * from "./api-helpers"
