import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/** POST - Admin endpoint to broadcast notification to all users */
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const title = typeof body.title === "string" ? body.title.trim() : ""
    const message = typeof body.message === "string" ? body.message.trim() : ""
    const type = typeof body.type === "string" ? body.type : "PROMOTION"

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    const prisma = await getPrismaClient()

    // Get all users
    const allUsers = await prisma.user.findMany({
      select: { id: true }
    })

    if (allUsers.length === 0) {
      return NextResponse.json(
        { error: "No users found" },
        { status: 404 }
      )
    }

    // Create notifications for all users
    const notifications = await Promise.all(
      allUsers.map(u =>
        prisma.notification.create({
          data: {
            userId: u.id,
            title,
            message: message || title,
            type,
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      count: notifications.length,
      message: `Notification broadcasted to ${notifications.length} user(s)`,
    }, { status: 201 })
  } catch (error) {
    console.error("Error broadcasting notification:", error)
    return NextResponse.json(
      { error: "Failed to broadcast notification" },
      { status: 500 }
    )
  }
}
