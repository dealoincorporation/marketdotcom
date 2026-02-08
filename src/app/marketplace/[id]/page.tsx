"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProductDetailsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to marketplace page - product details page is no longer used
    router.replace("/marketplace")
  }, [router])

  return null
}
