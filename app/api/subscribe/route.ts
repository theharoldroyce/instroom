import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, planId } = await req.json();

    if (!userId || !planId) {
      return NextResponse.json({ error: "Missing userId or planId" }, { status: 400 });
    }

    const subscription = await prisma.userSubscription.create({
      data: {
        user_id: userId,
        plan_id: planId,
      },
    });

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create subscription", details: error }, { status: 500 });
  }
}