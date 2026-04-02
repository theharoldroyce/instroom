import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { subscriptionID, userId, plan, cycle } = await req.json()

    if (!subscriptionID || !userId || !plan || !cycle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get the plan
    const planData = await prisma.subscriptionPlan.findUnique({
      where: { name: plan },
    })

    if (!planData) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    // Create or update subscription only after payment is confirmed
    const subscription = await prisma.userSubscription.upsert({
      where: { user_id: userId },
      update: {
        plan_id: planData.id,
        billing_cycle: cycle,
        payment_subscription_id: subscriptionID,
        status: "active",
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + (cycle === "yearly" ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000)),
      },
      create: {
        user_id: userId,
        plan_id: planData.id,
        billing_cycle: cycle,
        payment_subscription_id: subscriptionID,
        status: "active",
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + (cycle === "yearly" ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000)),
      },
    })

    return NextResponse.json({ success: true, subscription })
  } catch (error) {
    console.error("Subscription activation error:", error)
    return NextResponse.json(
      { error: "Failed to activate subscription", details: error },
      { status: 500 }
    )
  }
}
