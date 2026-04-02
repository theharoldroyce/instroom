import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json()
    console.log("🔍 Subscription check - received user_id:", user_id)
    
    if (!user_id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log("🔍 Querying subscription for user:", user_id)
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        user_id,
        status: { in: ["active", "trialing"] },
      },
    })

    console.log("🔍 Subscription found:", subscription)

    if (!subscription) {
      return NextResponse.json({ active: false }, { status: 200 })
    }

    return NextResponse.json({ active: true, subscription }, { status: 200 })
  } catch (error) {
    console.error("❌ Subscription check error:", error)
    return NextResponse.json(
      { error: "Failed to check subscription", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}