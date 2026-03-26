import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name } = body

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password_hash: hashedPassword,
      },
    })

    // Create onboarding record
    await prisma.onboarding.create({
      data: {
        user_id: user.id,
      },
    })

    // Create default subscription (trialing Solo plan)
    const soloPlan = await prisma.subscriptionPlan.findUnique({
      where: { name: "solo" },
    })

    if (soloPlan) {
      await prisma.userSubscription.create({
        data: {
          user_id: user.id,
          plan_id: soloPlan.id,
          status: "trialing",
          current_period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        },
      })
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
