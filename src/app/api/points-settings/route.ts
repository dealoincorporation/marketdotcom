import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

const DEFAULT_POINTS_SETTINGS = {
  amountThreshold: 50000,
  periodDays: 30,
  pointsPerThreshold: 1,
  pointsPerNaira: 0.01,
  nairaPerPoint: 10,
  minimumPointsToConvert: 100,
  conversionCooldownDays: 30,
  isActive: true,
  description: null as string | null
}

/** GET - Returns latest saved config (for admin edit form). Public for display. */
export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrismaClient()
    const settings = await prisma.pointsSettings.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    if (!settings) {
      return NextResponse.json(DEFAULT_POINTS_SETTINGS)
    }

    return NextResponse.json({
      amountThreshold: settings.amountThreshold ?? DEFAULT_POINTS_SETTINGS.amountThreshold,
      periodDays: (settings as { periodDays?: number }).periodDays ?? DEFAULT_POINTS_SETTINGS.periodDays,
      pointsPerThreshold: settings.pointsPerThreshold ?? DEFAULT_POINTS_SETTINGS.pointsPerThreshold,
      pointsPerNaira: settings.pointsPerNaira ?? DEFAULT_POINTS_SETTINGS.pointsPerNaira,
      nairaPerPoint: settings.nairaPerPoint ?? DEFAULT_POINTS_SETTINGS.nairaPerPoint,
      minimumPointsToConvert: settings.minimumPointsToConvert ?? DEFAULT_POINTS_SETTINGS.minimumPointsToConvert,
      conversionCooldownDays: settings.conversionCooldownDays ?? DEFAULT_POINTS_SETTINGS.conversionCooldownDays,
      isActive: settings.isActive ?? DEFAULT_POINTS_SETTINGS.isActive,
      description: settings.description ?? DEFAULT_POINTS_SETTINGS.description
    })
  } catch (error: unknown) {
    console.error("Error fetching points settings:", error)
    // When DB is unreachable (e.g. DNS/network), return defaults so app doesn't break
    const isConnectionError =
      error instanceof Error &&
      (error.name === 'PrismaClientInitializationError' ||
        /connection|DNS|ECONNREFUSED|ENOTFOUND/i.test(error.message))
    if (isConnectionError) {
      return NextResponse.json(DEFAULT_POINTS_SETTINGS)
    }
    return NextResponse.json(
      { error: "Failed to fetch points settings" },
      { status: 500 }
    )
  }
}

/** PUT - Admin only: update points settings */
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

    const amountThreshold = typeof body.amountThreshold === 'number' ? body.amountThreshold : parseInt(body.amountThreshold, 10) || 50000
    const periodDays = typeof body.periodDays === 'number' ? body.periodDays : parseInt(body.periodDays, 10) || 30
    const pointsPerThreshold = typeof body.pointsPerThreshold === 'number' ? body.pointsPerThreshold : parseInt(body.pointsPerThreshold, 10) || 1
    const pointsPerNaira = typeof body.pointsPerNaira === 'number' ? body.pointsPerNaira : parseFloat(body.pointsPerNaira) ?? 0.01
    const nairaPerPoint = typeof body.nairaPerPoint === 'number' ? body.nairaPerPoint : parseFloat(body.nairaPerPoint) ?? 10
    const minimumPointsToConvert = typeof body.minimumPointsToConvert === 'number' ? body.minimumPointsToConvert : parseInt(body.minimumPointsToConvert, 10) || 100
    const conversionCooldownDays = typeof body.conversionCooldownDays === 'number' ? body.conversionCooldownDays : parseInt(body.conversionCooldownDays, 10) || 30
    const isActive = body.isActive !== false
    const description = body.description != null ? String(body.description).trim() || null : null

    const existing = await prisma.pointsSettings.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    let settings
    if (existing) {
      settings = await prisma.pointsSettings.update({
        where: { id: existing.id },
        data: {
          amountThreshold,
          periodDays,
          pointsPerThreshold,
          pointsPerNaira,
          nairaPerPoint,
          minimumPointsToConvert,
          conversionCooldownDays,
          isActive,
          description
        }
      })
    } else {
      settings = await prisma.pointsSettings.create({
        data: {
          amountThreshold,
          periodDays,
          pointsPerThreshold,
          pointsPerNaira,
          nairaPerPoint,
          minimumPointsToConvert,
          conversionCooldownDays,
          isActive,
          description
        }
      })
    }

    return NextResponse.json({
      amountThreshold: settings.amountThreshold,
      periodDays: (settings as { periodDays?: number }).periodDays ?? 30,
      pointsPerThreshold: settings.pointsPerThreshold,
      pointsPerNaira: settings.pointsPerNaira,
      nairaPerPoint: settings.nairaPerPoint,
      minimumPointsToConvert: settings.minimumPointsToConvert,
      conversionCooldownDays: settings.conversionCooldownDays,
      isActive: settings.isActive,
      description: settings.description
    })
  } catch (error: unknown) {
    console.error("Error updating points settings:", error)
    return NextResponse.json(
      { error: "Failed to update points settings" },
      { status: 500 }
    )
  }
}
