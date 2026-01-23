/**
 * Bulk update product groupName for existing products
 * Run: node --loader ts-node/esm update-product-groups.js
 * Or: npx tsx update-product-groups.js
 */

import { PrismaClient } from '@prisma/client'

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

async function updateProductGroups() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Connecting to database...')
    
    console.log('📦 Fetching all products...')
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    })
    
    console.log(`Found ${products.length} products\n`)
    
    let updated = 0
    let skipped = 0
    
    for (const product of products) {
      // Skip if already has a groupName
      if (product.groupName) {
        console.log(`⏭️  Skipping "${product.name}" (already has groupName: ${product.groupName})`)
        skipped++
        continue
      }
      
      // Find matching group
      const mapping = GROUP_MAPPINGS.find(m => m.pattern.test(product.name))
      
      if (mapping) {
        console.log(`✨ Updating "${product.name}" → groupName: "${mapping.groupName}"`)
        
        await prisma.product.update({
          where: { id: product.id },
          data: { groupName: mapping.groupName }
        })
        
        updated++
      } else {
        console.log(`⚠️  No mapping found for "${product.name}" (category: ${product.category?.name || 'N/A'})`)
        skipped++
      }
    }
    
    console.log(`\n✅ Done! Updated ${updated} products, skipped ${skipped}`)
    
    // Show summary by group
    const grouped = await prisma.product.findMany({
      where: { groupName: { not: null } },
      select: { groupName: true, name: true }
    })
    
    const groups = {}
    grouped.forEach(p => {
      if (!groups[p.groupName]) {
        groups[p.groupName] = []
      }
      groups[p.groupName].push(p.name)
    })
    
    console.log('\n📊 Products by Group:')
    Object.entries(groups).forEach(([group, names]) => {
      console.log(`  ${group}: ${names.length} products`)
      names.forEach(name => console.log(`    - ${name}`))
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    process.exit(0)
  }
}

updateProductGroups()
