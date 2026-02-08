import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupDeliverySlots() {
  console.log('Setting up default delivery slots...')
  try {
    console.log('Setting up default delivery slots...')

    // Create slots for the next 7 days
    const slots = []
    const timeSlots = [
      '9:00 AM - 12:00 PM',
      '12:00 PM - 3:00 PM',
      '3:00 PM - 6:00 PM',
      '6:00 PM - 9:00 PM'
    ]

    for (let i = 1; i <= 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)

      for (const timeSlot of timeSlots) {
        slots.push({
          date,
          timeSlot,
          maxOrders: 15,
          isAvailable: true,
          description: `Standard delivery slot`
        })
      }
    }

    // Create the slots in the database
    for (const slot of slots) {
      try {
        await prisma.deliverySlot.create({
          data: slot
        })
        console.log(`Created slot: ${slot.date.toDateString()} - ${slot.timeSlot}`)
      } catch (error) {
        // Skip if slot already exists (unique constraint)
        if (error.code !== 'P2002') {
          console.error('Error creating slot:', error)
        }
      }
    }

    console.log(`Successfully set up ${slots.length} delivery slots!`)

    // Show current slots
    const currentSlots = await prisma.deliverySlot.findMany({
      orderBy: [
        { date: 'asc' },
        { timeSlot: 'asc' }
      ]
    })

    console.log('\nCurrent delivery slots:')
    currentSlots.forEach(slot => {
      console.log(`${slot.date.toDateString()} - ${slot.timeSlot} (${slot.isAvailable ? 'Available' : 'Unavailable'})`)
    })

  } catch (error) {
    console.error('Error setting up delivery slots:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupDeliverySlots()