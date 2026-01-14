import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPrismaClient } from "@/lib/prisma";

const subscribeSchema = z.object({
  email: z.string()
    .min(1, "Email address is required")
    .email("Please provide a valid email address")
    .max(254, "Email address is too long")
    .refine((email) => {
      // Additional validation for email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }, "Invalid email format")
    .refine((email) => {
      // Check for valid domain format
      const domain = email.split('@')[1]
      return domain && domain.includes('.') && !domain.includes('..')
    }, "Invalid email domain"),
  source: z.string().optional().default("FOOTER"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source } = subscribeSchema.parse(body);

    // Get Prisma client lazily to avoid build-time initialization
    const prisma = await getPrismaClient();

    // Check if database is available
    if (!prisma || typeof prisma.subscription?.findUnique !== 'function') {
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    // Check if email is already subscribed
    const existingSubscription = await prisma.subscription.findUnique({
      where: { email },
    });

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return NextResponse.json(
          { error: "This email is already subscribed to our newsletter" },
          { status: 409 }
        );
      } else {
        // Reactivate subscription
        await prisma.subscription.update({
          where: { email },
          data: { isActive: true, updatedAt: new Date() },
        });

        return NextResponse.json({
          message: "Welcome back! Your subscription has been reactivated.",
        });
      }
    }

    // Create new subscription
    const subscription = await prisma.subscription.create({
      data: {
        email,
        source,
      },
    });

    return NextResponse.json({
      message: "Thank you for subscribing! You'll receive updates about our latest offers and services.",
      subscription,
    });

  } catch (error) {
    console.error("Subscription error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get Prisma client lazily to avoid build-time initialization
    const prisma = await getPrismaClient()

    // Check if database is available
    if (!prisma || typeof prisma.subscription?.count !== 'function') {
      // Return mock data during build time
      return NextResponse.json({
        totalSubscribers: 0,
        message: "Database temporarily unavailable"
      })
    }

    const totalSubscribers = await prisma.subscription.count({
      where: { isActive: true },
    });

    return NextResponse.json({
      totalSubscribers,
    });
  } catch (error) {
    console.error("Get subscribers error:", error);

    // If it's a database connection error, return fallback data
    if (error instanceof Error && (error.message.includes('server selection') || (error as any).code === 'P2010')) {
      return NextResponse.json({
        totalSubscribers: 0,
        message: "Database temporarily unavailable"
      })
    }

    return NextResponse.json(
      { error: "Failed to fetch subscriber count" },
      { status: 500 }
    );
  }
}