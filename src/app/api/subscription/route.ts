import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const subscribeSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  source: z.string().optional().default("FOOTER"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source } = subscribeSchema.parse(body);

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
    const totalSubscribers = await prisma.subscription.count({
      where: { isActive: true },
    });

    return NextResponse.json({
      totalSubscribers,
    });
  } catch (error) {
    console.error("Get subscribers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriber count" },
      { status: 500 }
    );
  }
}