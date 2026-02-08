import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/** GET - List notifications for the current user (or all notifications if admin) */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const prisma = await getPrismaClient()
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100)
    const unreadOnly = searchParams.get("unreadOnly") === "true"
    const userId = searchParams.get("userId") // For admin to view specific user's notifications

    // Admin can view all notifications or specific user's notifications
    const isAdmin = user.role === "ADMIN"
    
    const whereClause: any = {}
    
    if (isAdmin && userId) {
      // Admin viewing specific user's notifications
      whereClause.userId = userId
    } else if (!isAdmin) {
      // Regular users only see their own notifications
      whereClause.userId = user.userId
    }
    // If admin and no userId specified, they see all notifications
    
    if (unreadOnly) {
      whereClause.isRead = false
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        user: isAdmin ? {
          select: {
            id: true,
            name: true,
            email: true
          }
        } : false,
        order: isAdmin ? {
          select: {
            id: true,
            status: true
          }
        } : false
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

/** POST - Create a notification for the current user or send to specific users (admin only for sending to others) */
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const title = typeof body.title === "string" ? body.title.trim() : ""
    const message = typeof body.message === "string" ? body.message.trim() : ""
    const type = typeof body.type === "string" ? body.type : "ADMIN"
    const targetUserId = typeof body.userId === "string" ? body.userId : null
    const broadcastToAll = body.broadcastToAll === true // Admin can broadcast to all users
    const userIds = Array.isArray(body.userIds) ? body.userIds : [] // Admin can send to multiple users

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    const prisma = await getPrismaClient()
    const isAdmin = user.role === "ADMIN"

    // If admin wants to broadcast to all users
    if (broadcastToAll && isAdmin) {
      const allUsers = await prisma.user.findMany({
        select: { id: true }
      })

      const notifications = await Promise.all(
        allUsers.map(u =>
          prisma.notification.create({
            data: {
              userId: u.id,
              title,
              message: message || title,
              type: type || "PROMOTION",
            },
          })
        )
      )

      return NextResponse.json({
        success: true,
        count: notifications.length,
        message: `Notification sent to ${notifications.length} users`,
        notifications
      }, { status: 201 })
    }

    // If admin wants to send to specific users
    if (userIds.length > 0 && isAdmin) {
      const notifications = await Promise.all(
        userIds.map((userId: string) =>
          prisma.notification.create({
            data: {
              userId,
              title,
              message: message || title,
              type: type || "PROMOTION",
            },
          })
        )
      )

      return NextResponse.json({
        success: true,
        count: notifications.length,
        message: `Notification sent to ${notifications.length} user(s)`,
        notifications
      }, { status: 201 })
    }

    // If admin wants to send to a specific user
    if (targetUserId && isAdmin) {
      const notification = await prisma.notification.create({
        data: {
          userId: targetUserId,
          title,
          message: message || title,
          type: type || "PROMOTION",
        },
      })

      return NextResponse.json({
        success: true,
        notification
      }, { status: 201 })
    }

    // Regular users can only create notifications for themselves
    // (This is for backward compatibility)
    const notification = await prisma.notification.create({
      data: {
        userId: user.userId,
        title,
        message: message || title,
        type,
      },
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    )
  }
}
