import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/** DELETE - Delete a notification */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const prisma = await getPrismaClient()
    const notificationId = params.id
    const isAdmin = user.role === "ADMIN"

    // Verify the notification exists and belongs to the user (or admin can delete any)
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        ...(isAdmin ? {} : { userId: user.userId }), // Admin can delete any, users can only delete their own
      },
    })

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    // Delete the notification using deleteMany for MongoDB compatibility
    // This won't throw an error if the record doesn't exist (race condition handling)
    const deleteResult = await prisma.notification.deleteMany({
      where: { 
        id: notificationId,
        ...(isAdmin ? {} : { userId: user.userId }), // Ensure users can only delete their own
      },
    })

    // Check if any record was actually deleted
    if (deleteResult.count === 0) {
      return NextResponse.json(
        { error: "Notification not found or already deleted" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: "Notification deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting notification:", error)
    
    // Handle Prisma P2025 error (record not found) gracefully
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Notification not found or already deleted" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    )
  }
}
