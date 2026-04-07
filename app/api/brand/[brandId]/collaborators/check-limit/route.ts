import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { brandId } = await params

    // Verify user owns the brand
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    })

    if (!brand || brand.owner_id !== session.user.id) {
      return NextResponse.json(
        { error: "Brand not found or you don't have permission" },
        { status: 403 }
      )
    }

    // Get user's subscription
    const subscription = await prisma.userSubscription.findUnique({
      where: { user_id: session.user.id },
      include: { plan: true },
    })

    if (!subscription || subscription.status !== "active") {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      )
    }

    // Count current collaborators
    const memberCount = await prisma.brandMember.count({
      where: { brand_id: brandId },
    })

    // Calculate seat limits
    const includedSeats = subscription.plan.included_seats
    const maxSeats = subscription.plan.max_seats || subscription.plan.included_seats
    const extraSeats = subscription.extra_seats
    const totalAvailable = includedSeats + extraSeats
    const pricePerSeatNum = subscription.plan.price_per_extra_seat ? parseFloat(subscription.plan.price_per_extra_seat.toString()) : 0
    const maxSeatsAvailable = maxSeats - totalAvailable

    const allowed = memberCount < totalAvailable
    const canBuyMore = 
      !allowed && 
      maxSeatsAvailable > 0 && 
      pricePerSeatNum > 0

    return NextResponse.json({
      allowed,
      canBuyMore,
      current: memberCount,
      max: totalAvailable,
      maxTotalSeats: maxSeats,
      maxSeatsAvailable,
      currentExtraSeats: extraSeats,
      pricePerSeat: pricePerSeatNum,
      message: allowed
        ? undefined
        : canBuyMore
          ? "You've reached your collaborator limit. Would you like to purchase extra seats?"
          : "You've reached your collaborator limit. Unable to purchase more seats for your plan.",
    })
  } catch (error) {
    console.error("Error checking collaborator limit:", error)
    return NextResponse.json(
      { error: "Failed to check collaborator limit" },
      { status: 500 }
    )
  }
}
