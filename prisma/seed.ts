import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Fruits & Vegetables' },
      update: {},
      create: {
        name: 'Fruits & Vegetables',
        description: 'Fresh, organic fruits and vegetables',
        image: '/categories/fruits-veg.jpg'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Grains & Cereals' },
      update: {},
      create: {
        name: 'Grains & Cereals',
        description: 'Rice, beans, maize, and other staples',
        image: '/categories/grains.jpg'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Proteins' },
      update: {},
      create: {
        name: 'Proteins',
        description: 'Meat, fish, eggs, and dairy products',
        image: '/categories/proteins.jpg'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Spices & Seasonings' },
      update: {},
      create: {
        name: 'Spices & Seasonings',
        description: 'Herbs, spices, and cooking essentials',
        image: '/categories/spices.jpg'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Beverages' },
      update: {},
      create: {
        name: 'Beverages',
        description: 'Drinks, juices, and refreshments',
        image: '/categories/beverages.jpg'
      }
    })
  ])

  console.log('✅ Categories created')

  // Create products
  const products = [
    // Fruits & Vegetables
    {
      name: 'Fresh Tomatoes',
      description: 'Ripe, juicy tomatoes perfect for cooking and salads',
      image: '/products/tomatoes.jpg',
      basePrice: 500,
      categoryId: categories[0].id,
      stock: 100
    },
    {
      name: 'Carrots',
      description: 'Crunchy, sweet carrots rich in vitamins',
      image: '/products/carrots.jpg',
      basePrice: 300,
      categoryId: categories[0].id,
      stock: 80
    },
    {
      name: 'Irish Potatoes',
      description: 'Premium quality potatoes for all your cooking needs',
      image: '/products/potatoes.jpg',
      basePrice: 800,
      categoryId: categories[0].id,
      stock: 120
    },
    {
      name: 'Fresh Onions',
      description: 'Red onions with excellent flavor',
      image: '/products/onions.jpg',
      basePrice: 400,
      categoryId: categories[0].id,
      stock: 90
    },
    {
      name: 'Bell Peppers',
      description: 'Colorful bell peppers - red, yellow, and green',
      image: '/products/peppers.jpg',
      basePrice: 600,
      categoryId: categories[0].id,
      stock: 60
    },

    // Grains & Cereals
    {
      name: 'Premium Rice',
      description: 'Long grain rice, perfect for everyday meals',
      image: '/products/rice.jpg',
      basePrice: 2500,
      categoryId: categories[1].id,
      stock: 200
    },
    {
      name: 'Honey Beans',
      description: 'Sweet, nutritious beans',
      image: '/products/beans.jpg',
      basePrice: 1200,
      categoryId: categories[1].id,
      stock: 150
    },
    {
      name: 'Maize (Corn)',
      description: 'Fresh yellow maize',
      image: '/products/maize.jpg',
      basePrice: 900,
      categoryId: categories[1].id,
      stock: 180
    },
    {
      name: 'Oatmeal',
      description: 'Nutritious oatmeal for healthy breakfast',
      image: '/products/oatmeal.jpg',
      basePrice: 1800,
      categoryId: categories[1].id,
      stock: 100
    },

    // Proteins
    {
      name: 'Fresh Chicken',
      description: 'Farm fresh chicken, hormone-free',
      image: '/products/chicken.jpg',
      basePrice: 3500,
      categoryId: categories[2].id,
      stock: 50
    },
    {
      name: 'Beef',
      description: 'Premium beef cuts',
      image: '/products/beef.jpg',
      basePrice: 4500,
      categoryId: categories[2].id,
      stock: 40
    },
    {
      name: 'Fresh Fish (Tilapia)',
      description: 'Fresh tilapia fish',
      image: '/products/tilapia.jpg',
      basePrice: 2800,
      categoryId: categories[2].id,
      stock: 30
    },
    {
      name: 'Eggs (Crate)',
      description: 'Farm fresh eggs, 30 pieces per crate',
      image: '/products/eggs.jpg',
      basePrice: 1800,
      categoryId: categories[2].id,
      stock: 25
    },

    // Spices & Seasonings
    {
      name: 'Ginger',
      description: 'Fresh ginger root',
      image: '/products/ginger.jpg',
      basePrice: 800,
      categoryId: categories[3].id,
      stock: 70
    },
    {
      name: 'Garlic',
      description: 'Fresh garlic bulbs',
      image: '/products/garlic.jpg',
      basePrice: 600,
      categoryId: categories[3].id,
      stock: 85
    },
    {
      name: 'Thyme',
      description: 'Dried thyme leaves',
      image: '/products/thyme.jpg',
      basePrice: 400,
      categoryId: categories[3].id,
      stock: 60
    },

    // Beverages
    {
      name: 'Palm Wine',
      description: 'Traditional palm wine',
      image: '/products/palm-wine.jpg',
      basePrice: 1200,
      categoryId: categories[4].id,
      stock: 45
    },
    {
      name: 'Fresh Coconut Water',
      description: 'Natural coconut water',
      image: '/products/coconut-water.jpg',
      basePrice: 300,
      categoryId: categories[4].id,
      stock: 35
    }
  ]

  for (const product of products) {
    const existingProduct = await prisma.product.findFirst({
      where: { name: product.name }
    })

    if (existingProduct) {
      // Update existing product
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: product
      })
    } else {
      // Create new product
      await prisma.product.create({
        data: product
      })
    }
  }

  console.log('✅ Products created')

  // Create some variations for products
  const tomatoes = await prisma.product.findFirst({ where: { name: 'Fresh Tomatoes' } })
  const potatoes = await prisma.product.findFirst({ where: { name: 'Irish Potatoes' } })
  const chicken = await prisma.product.findFirst({ where: { name: 'Fresh Chicken' } })

  if (tomatoes) {
    const tomatoVariations = [
      { name: 'Small', type: 'Size', price: 0, productId: tomatoes.id },
      { name: 'Medium', type: 'Size', price: 100, productId: tomatoes.id },
      { name: 'Large', type: 'Size', price: 200, productId: tomatoes.id }
    ]

    for (const variation of tomatoVariations) {
      await prisma.variation.upsert({
        where: {
          productId_name: {
            productId: variation.productId,
            name: variation.name
          }
        },
        update: {},
        create: variation
      })
    }
  }

  if (potatoes) {
    const potatoVariations = [
      { name: '5kg Bag', type: 'Weight', price: 0, productId: potatoes.id },
      { name: '10kg Bag', type: 'Weight', price: 2000, productId: potatoes.id },
      { name: '25kg Bag', type: 'Weight', price: 8000, productId: potatoes.id }
    ]

    for (const variation of potatoVariations) {
      await prisma.variation.upsert({
        where: {
          productId_name: {
            productId: variation.productId,
            name: variation.name
          }
        },
        update: {},
        create: variation
      })
    }
  }

  if (chicken) {
    const chickenVariations = [
      { name: 'Whole Chicken', type: 'Cut', price: 0, productId: chicken.id },
      { name: 'Chicken Breast', type: 'Cut', price: 500, productId: chicken.id },
      { name: 'Chicken Thighs', type: 'Cut', price: 300, productId: chicken.id },
      { name: 'Drumsticks', type: 'Cut', price: 400, productId: chicken.id }
    ]

    for (const variation of chickenVariations) {
      await prisma.variation.upsert({
        where: {
          productId_name: {
            productId: variation.productId,
            name: variation.name
          }
        },
        update: {},
        create: variation
      })
    }
  }

  console.log('✅ Product variations created')
  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
