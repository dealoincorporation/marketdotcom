import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const DEFAULTS = {
  baseFee: 500,
  feePerKg: 50,
  feeTier1: 2000,
  feeTier2: 3500,
  feeTier3: 5000,
  minimumOrderQuantity: 1,
  minimumOrderAmount: 0,
}

const DEFAULT_DELIVERY_INFO_POINTS = [
  "Orders delivered within 4 hours of scheduled time",
  "Place orders before 10 AM for same-day delivery",
  "Orders after 3 PM delivered next day",
  "Delivery fees calculated per product",
  "SMS & email updates on delivery status",
]

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

    let deliveryInfoPoints: string[] = DEFAULT_DELIVERY_INFO_POINTS
    if (settings.deliveryInfoPoints) {
      try {
        const parsed = JSON.parse(settings.deliveryInfoPoints) as unknown
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
          deliveryInfoPoints = parsed.filter(Boolean)
        }
      } catch {
        // use default
      }
    }

    return NextResponse.json({
      baseFee: settings.baseFee ?? DEFAULTS.baseFee,
      feePerKg: settings.feePerKg ?? DEFAULTS.feePerKg,
      feeTier1: (settings as any).feeTier1 ?? DEFAULTS.feeTier1,
      feeTier2: (settings as any).feeTier2 ?? DEFAULTS.feeTier2,
      feeTier3: (settings as any).feeTier3 ?? DEFAULTS.feeTier3,
      minimumOrderQuantity: settings.minimumOrderQuantity ?? DEFAULTS.minimumOrderQuantity,
      minimumOrderAmount: settings.minimumOrderAmount ?? DEFAULTS.minimumOrderAmount,
      deliveryInfoPoints,
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

    let deliveryInfoPoints: string[] | undefined
    if (body.deliveryInfoPoints !== undefined) {
      const raw = body.deliveryInfoPoints
      if (Array.isArray(raw) && raw.every((x) => typeof x === "string")) {
        deliveryInfoPoints = raw.map((s) => String(s).trim()).filter(Boolean)
      } else {
        return NextResponse.json(
          { error: "deliveryInfoPoints must be an array of non-empty strings" },
          { status: 400 }
        )
      }
    }

    let settings = await prisma.deliverySettings.findFirst({
      orderBy: { updatedAt: "desc" },
    })

    const existing = settings
      ? {
          baseFee: settings.baseFee ?? DEFAULTS.baseFee,
          feePerKg: settings.feePerKg ?? DEFAULTS.feePerKg,
          minimumOrderQuantity: settings.minimumOrderQuantity ?? DEFAULTS.minimumOrderQuantity,
          minimumOrderAmount: settings.minimumOrderAmount ?? DEFAULTS.minimumOrderAmount,
        }
      : null

    const baseFee =
      typeof body.baseFee === "number"
        ? body.baseFee
        : body.baseFee !== undefined
          ? parseFloat(body.baseFee)
          : existing?.baseFee ?? DEFAULTS.baseFee
    const feePerKg =
      typeof body.feePerKg === "number"
        ? body.feePerKg
        : body.feePerKg !== undefined
          ? parseFloat(body.feePerKg)
          : existing?.feePerKg ?? DEFAULTS.feePerKg
    const minimumOrderQuantity =
      typeof body.minimumOrderQuantity === "number"
        ? body.minimumOrderQuantity
        : body.minimumOrderQuantity !== undefined
          ? parseInt(String(body.minimumOrderQuantity), 10)
          : existing?.minimumOrderQuantity ?? DEFAULTS.minimumOrderQuantity
    const minimumOrderAmount =
      typeof body.minimumOrderAmount === "number"
        ? body.minimumOrderAmount
        : body.minimumOrderAmount !== undefined
          ? parseFloat(String(body.minimumOrderAmount ?? 0))
          : existing?.minimumOrderAmount ?? DEFAULTS.minimumOrderAmount

    const feeTier1 =
      typeof body.feeTier1 === "number"
        ? body.feeTier1
        : body.feeTier1 !== undefined
          ? parseFloat(body.feeTier1)
          : (existing as any)?.feeTier1 ?? DEFAULTS.feeTier1
    const feeTier2 =
      typeof body.feeTier2 === "number"
        ? body.feeTier2
        : body.feeTier2 !== undefined
          ? parseFloat(body.feeTier2)
          : (existing as any)?.feeTier2 ?? DEFAULTS.feeTier2
    const feeTier3 =
      typeof body.feeTier3 === "number"
        ? body.feeTier3
        : body.feeTier3 !== undefined
          ? parseFloat(body.feeTier3)
          : (existing as any)?.feeTier3 ?? DEFAULTS.feeTier3

    if (Number.isNaN(baseFee) || baseFee < 0) {
      return NextResponse.json({ error: "Invalid baseFee" }, { status: 400 })
    }
    if (Number.isNaN(feePerKg) || feePerKg < 0) {
      return NextResponse.json({ error: "Invalid feePerKg" }, { status: 400 })
    }
    if (Number.isNaN(feeTier1) || feeTier1 < 0) {
      return NextResponse.json({ error: "Invalid feeTier1" }, { status: 400 })
    }
    if (Number.isNaN(feeTier2) || feeTier2 < 0) {
      return NextResponse.json({ error: "Invalid feeTier2" }, { status: 400 })
    }
    if (Number.isNaN(feeTier3) || feeTier3 < 0) {
      return NextResponse.json({ error: "Invalid feeTier3" }, { status: 400 })
    }
    if (Number.isNaN(minimumOrderQuantity) || minimumOrderQuantity < 1) {
      return NextResponse.json({ error: "minimumOrderQuantity must be at least 1" }, { status: 400 })
    }
    if (Number.isNaN(minimumOrderAmount) || minimumOrderAmount < 0) {
      return NextResponse.json({ error: "minimumOrderAmount must be 0 or greater" }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {
      baseFee,
      feePerKg,
      feeTier1,
      feeTier2,
      feeTier3,
      minimumOrderQuantity,
      minimumOrderAmount,
    }
    if (deliveryInfoPoints !== undefined) {
      updateData.deliveryInfoPoints = JSON.stringify(deliveryInfoPoints)
    }

    if (!settings) {
      settings = await prisma.deliverySettings.create({
        data: updateData,
      })
    } else {
      settings = await prisma.deliverySettings.update({
        where: { id: settings.id },
        data: updateData,
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

    let responsePoints: string[] = DEFAULT_DELIVERY_INFO_POINTS
    if (settings.deliveryInfoPoints) {
      try {
        const parsed = JSON.parse(settings.deliveryInfoPoints) as unknown
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
          responsePoints = parsed.filter(Boolean)
        }
      } catch {
        // use default
      }
    }

    return NextResponse.json({
      baseFee: settings.baseFee,
      feePerKg: settings.feePerKg,
      feeTier1: (settings as any).feeTier1 ?? DEFAULTS.feeTier1,
      feeTier2: (settings as any).feeTier2 ?? DEFAULTS.feeTier2,
      feeTier3: (settings as any).feeTier3 ?? DEFAULTS.feeTier3,
      minimumOrderQuantity: settings.minimumOrderQuantity,
      minimumOrderAmount: settings.minimumOrderAmount,
      deliveryInfoPoints: responsePoints,
    })
  } catch (error) {
    console.error("Error updating delivery settings:", error)
    return NextResponse.json(
      { error: "Failed to update delivery settings" },
      { status: 500 }
    )
  }
}
