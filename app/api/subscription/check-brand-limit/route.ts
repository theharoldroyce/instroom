import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's subscription
    const subscription = await prisma.userSubscription.findUnique({
      where: { user_id: session.user.id },
      include: { plan: true },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      )
    }

    if (subscription.status !== "active") {
      return NextResponse.json(
        { error: "Subscription is not active" },
        { status: 400 }
      )
    }

    // Count current brands owned by user
    const brandCount = await prisma.brand.count({
      where: { owner_id: session.user.id },
    })

    // Handle unlimited (Agency plan) vs limited plans
    const isUnlimited = subscription.plan.max_brands === null
    const includedBrands = subscription.plan.included_brands
    const maxBrands = isUnlimited ? null : (subscription.plan.max_brands ?? includedBrands)
    const totalAvailable = isUnlimited ? null : (includedBrands + subscription.extra_brands)

    const allowed = isUnlimited || (brandCount < totalAvailable!)

    return NextResponse.json({
      allowed,
      current: brandCount,
      max: totalAvailable,
      message: allowed ? undefined : "You've reached your brand limit",
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check brand limit" },
      { status: 500 }
    )
  }
}
