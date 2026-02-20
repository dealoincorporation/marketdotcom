import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

// GET /api/addresses - Get user's addresses
export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient()
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const addresses = await prisma.address.findMany({
      where: {
        userId: user.userId,
        state: { equals: 'Lagos', mode: 'insensitive' }
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(addresses)
  } catch (error: any) {
    console.error("Error fetching addresses:", error)
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST /api/addresses - Create new address
export async function POST(request: NextRequest) {
  console.log("=== ADDRESS CREATION DEBUG ===")
  console.log("Environment:", {
    nodeEnv: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL
  })

  const prisma = await getPrismaClient()
  console.log("Prisma client type:", typeof prisma)
  console.log("Prisma keys:", Object.keys(prisma || {}).filter(k => !k.startsWith('$') && !k.startsWith('_')).sort())

  // Check if database is available
  if (!prisma) {
    console.error("Prisma client is null/undefined")
    return NextResponse.json(
      { error: "Database connection issue - client null" },
      { status: 500 }
    )
  }

  if (!prisma.address) {
    console.error("Prisma address model not available. Available models:", Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_')).sort())
    return NextResponse.json(
      { error: "Database connection issue - address model missing" },
      { status: 500 }
    )
  }

  if (typeof prisma.address?.updateMany !== 'function') {
    console.error("Prisma address.updateMany not available:", typeof prisma.address?.updateMany)
    return NextResponse.json(
      { error: "Database connection issue - updateMany method missing" },
      { status: 500 }
    )
  }

  console.log("All checks passed, proceeding with address creation...")

  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      type,
      name,
      address,
      city,
      state,
      postalCode,
      phone,
      isDefault,
      deliveryNotes,
      coordinates
    } = body

    if (!state || String(state).trim().toLowerCase() !== 'lagos') {
      return NextResponse.json(
        { error: 'Delivery is only available in Lagos. Please use a Lagos address.' },
        { status: 400 }
      )
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.userId, isDefault: true },
        data: { isDefault: false }
      })
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: user.userId,
        type,
        name,
        address,
        city,
        state: 'Lagos',
        postalCode,
        phone,
        isDefault: isDefault || false,
        deliveryNotes,
        coordinates: coordinates ? JSON.stringify(coordinates) : null
      }
    })

    return NextResponse.json(newAddress, { status: 201 })
  } catch (error: any) {
    console.error("Error creating address:", error)
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}