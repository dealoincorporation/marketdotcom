import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { PaystackService, generateReference } from "@/lib/paystack"

export async function POST(request: Request) {
  try {
    const prisma = await getPrismaClient()
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { amount, method } = await request.json()

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: "Minimum funding amount is ₦100" },
        { status: 400 }
      )
    }

    // Generate unique reference for the wallet funding
    const reference = generateReference()

    // Create a pending wallet transaction record
    await prisma.walletTransaction.create({
      data: {
        userId: user.userId,
        type: "CREDIT",
        amount,
        method,
        description: `Wallet funding via ${method}`,
        status: "PENDING",
        reference
      }
    })

    // Initialize Paystack transaction
    // Get base URL - use env var if set, otherwise use localhost in dev, production domain in production
    const isProd = process.env.NODE_ENV === "production"
    const envBaseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL
    const fallbackBaseUrl = isProd ? "https://marketdotcom.ng" : "http://localhost:3000"

    // In production, never use localhost for redirects (it leaves users stuck on Paystack success page)
    const baseUrl = (isProd && envBaseUrl?.includes("localhost"))
      ? fallbackBaseUrl
      : (envBaseUrl || fallbackBaseUrl)

    if (isProd && envBaseUrl?.includes("localhost")) {
      console.error("⚠️ Misconfigured app URL detected: env base URL points to localhost in production. Falling back to:", fallbackBaseUrl)
    }
    
    const paystackResponse = await PaystackService.initializeTransaction({
      amount: amount,
      email: user.email || "",
      reference: reference,
      callback_url: `${baseUrl}/dashboard?tab=wallet&reference=${reference}`,
      metadata: {
        userId: user.userId,
        type: "wallet_funding",
        custom_fields: [
          {
            display_name: "Funding Type",
            variable_name: "funding_type",
            value: "wallet"
          },
          {
            display_name: "Amount",
            variable_name: "amount",
            value: amount.toString()
          }
        ]
      }
    })

    if (!paystackResponse.status) {
      // Update transaction status to failed
      await prisma.walletTransaction.updateMany({
        where: { reference },
        data: { status: "FAILED" }
      })

      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      reference: reference,
      authorization_url: paystackResponse.data.authorization_url,
      access_code: paystackResponse.data.access_code
    })

  } catch (error) {
    console.error("Error funding wallet:", error)
    return NextResponse.json(
      { error: "Failed to fund wallet" },
      { status: 500 }
    )
  }
}