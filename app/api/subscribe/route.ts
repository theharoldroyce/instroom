import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, planId, cycle, extraSeats = 0, extraBrands = 0 } = await req.json();

    if (!userId || !planId || !cycle) {
      return NextResponse.json({ error: "Missing userId, planId, or cycle" }, { status: 400 });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { name: planId }, 
    });

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const subscription = await prisma.userSubscription.upsert({
      where: { user_id: userId },
      update: {
        plan_id: plan.id,
        billing_cycle: cycle,
        extra_brands: extraBrands,
        extra_seats: extraSeats,
        status: "active",
      },
      create: {
        user_id: userId,
        plan_id: plan.id,
        billing_cycle: cycle,
        extra_brands: extraBrands,
        extra_seats: extraSeats,
        status: "active",
      },
    });

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create subscription", details: error }, { status: 500 });
  }
}