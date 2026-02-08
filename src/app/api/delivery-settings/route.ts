import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const DEFAULTS = {
  baseFee: 500,
  feePerKg: 50,
  minimumOrderQuantity: 1,
  minimumOrderAmount: 0,
}

/** GET - Returns delivery & MOQ settings (creates default row if none). */
export async function GET() {
  try {
    const prisma = await getPrismaClient()
    let settings = await prisma.deliverySettings.findFirst({
      orderBy: { updatedAt: "desc" },
    })

    if (!settings) {
      settings = await prisma.deliverySettings.create({
        data: {
          baseFee: DEFAULTS.baseFee,
          feePerKg: DEFAULTS.feePerKg,
          minimumOrderQuantity: DEFAULTS.minimumOrderQuantity,
          minimumOrderAmount: DEFAULTS.minimumOrderAmount,
        },
      })
    }

    return NextResponse.json({
      baseFee: settings.baseFee ?? DEFAULTS.baseFee,
      feePerKg: settings.feePerKg ?? DEFAULTS.feePerKg,
      minimumOrderQuantity: settings.minimumOrderQuantity ?? DEFAULTS.minimumOrderQuantity,
      minimumOrderAmount: settings.minimumOrderAmount ?? DEFAULTS.minimumOrderAmount,
    })
  } catch (error) {
    console.error("Error fetching delivery settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch delivery settings" },
      { status: 500 }
    )
  }
}

/** PUT - Admin only: update delivery & MOQ settings */
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const prisma = await getPrismaClient()
    const body = await request.json()

    const baseFee = typeof body.baseFee === "number" ? body.baseFee : parseFloat(body.baseFee)
    const feePerKg = typeof body.feePerKg === "number" ? body.feePerKg : parseFloat(body.feePerKg)
    const minimumOrderQuantity =
      typeof body.minimumOrderQuantity === "number"
        ? body.minimumOrderQuantity
        : parseInt(String(body.minimumOrderQuantity), 10)
    const minimumOrderAmount =
      typeof body.minimumOrderAmount === "number"
        ? body.minimumOrderAmount
        : parseFloat(String(body.minimumOrderAmount ?? 0))

    if (Number.isNaN(baseFee) || baseFee < 0) {
      return NextResponse.json({ error: "Invalid baseFee" }, { status: 400 })
    }
    if (Number.isNaN(feePerKg) || feePerKg < 0) {
      return NextResponse.json({ error: "Invalid feePerKg" }, { status: 400 })
    }
    if (Number.isNaN(minimumOrderQuantity) || minimumOrderQuantity < 1) {
      return NextResponse.json({ error: "minimumOrderQuantity must be at least 1" }, { status: 400 })
    }
    if (Number.isNaN(minimumOrderAmount) || minimumOrderAmount < 0) {
      return NextResponse.json({ error: "minimumOrderAmount must be 0 or greater" }, { status: 400 })
    }

    let settings = await prisma.deliverySettings.findFirst({
      orderBy: { updatedAt: "desc" },
    })

    if (!settings) {
      settings = await prisma.deliverySettings.create({
        data: {
          baseFee,
          feePerKg,
          minimumOrderQuantity,
          minimumOrderAmount,
        },
      })
    } else {
      settings = await prisma.deliverySettings.update({
        where: { id: settings.id },
        data: {
          baseFee,
          feePerKg,
          minimumOrderQuantity,
          minimumOrderAmount,
        },
      })
    }

    await prisma.notification.create({
      data: {
        userId: user.userId,
        title: "Global Delivery & MOQ updated",
        message: "Delivery and MOQ settings have been saved successfully.",
        type: "DELIVERY",
      },
    })

    return NextResponse.json({
      baseFee: settings.baseFee,
      feePerKg: settings.feePerKg,
      minimumOrderQuantity: settings.minimumOrderQuantity,
      minimumOrderAmount: settings.minimumOrderAmount,
    })
  } catch (error) {
    console.error("Error updating delivery settings:", error)
    return NextResponse.json(
      { error: "Failed to update delivery settings" },
      { status: 500 }
    )
  }
}
