import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Mapping of product name patterns to group names
const GROUP_MAPPINGS = [
  // Rice products
  { pattern: /mama gold/i, groupName: 'Rice' },
  { pattern: /caprice/i, groupName: 'Rice' },
  { pattern: /rice/i, groupName: 'Rice' },
  
  // Add more mappings as needed
  // { pattern: /tomato/i, groupName: 'Tomatoes' },
  // { pattern: /onion/i, groupName: 'Onions' },
]

// POST /api/products/bulk-update-groups - Bulk update product groupName (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    const prisma = await getPrismaClient()
    
    console.log('📦 Fetching all products...')
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    })
    
    const results = {
      total: products.length,
      updated: 0,
      skipped: 0,
      updates: [] as Array<{ name: string; groupName: string }>,
      skippedProducts: [] as Array<{ name: string; reason: string }>
    }
    
    for (const product of products) {
      // Skip if already has a groupName
      if (product.groupName) {
        results.skippedProducts.push({
          name: product.name,
          reason: `Already has groupName: ${product.groupName}`
        })
        results.skipped++
        continue
      }
      
      // Find matching group
      const mapping = GROUP_MAPPINGS.find(m => m.pattern.test(product.name))
      
      if (mapping) {
        await prisma.product.update({
          where: { id: product.id },
          data: { groupName: mapping.groupName }
        })
        
        results.updates.push({
          name: product.name,
          groupName: mapping.groupName
        })
        results.updated++
      } else {
        results.skippedProducts.push({
          name: product.name,
          reason: 'No matching pattern found'
        })
        results.skipped++
      }
    }
    
    // Get summary by group
    const grouped = await prisma.product.findMany({
      where: { groupName: { not: null } },
      select: { groupName: true, name: true }
    })
    
    const groups: Record<string, string[]> = {}
    grouped.forEach(p => {
      if (p.groupName && !groups[p.groupName]) {
        groups[p.groupName] = []
      }
      if (p.groupName) {
        groups[p.groupName].push(p.name)
      }
    })
    
    return NextResponse.json({
      success: true,
      message: `Updated ${results.updated} products, skipped ${results.skipped}`,
      results,
      groups
    })
  } catch (error) {
    console.error("Error bulk updating product groups:", error)
    return NextResponse.json(
      { error: "Failed to update product groups", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
