import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { goal, website, team_size, revenue, source, user_id } = await req.json()

    console.log("Onboarding POST request received:", { user_id, goal })

    // Validate required fields
    if (!user_id) {
      console.error("No user_id provided")
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    if (!goal) {
      return NextResponse.json(
        { error: "Goal is required" },
        { status: 400 }
      )
    }

    // Check if user exists in database
    const userExists = await prisma.user.findUnique({
      where: { id: user_id },
    })
    console.log("User exists in database:", !!userExists)

    // Update or create onboarding record
    const onboarding = await prisma.onboarding.upsert({
      where: { user_id },
      update: {
        goal,
        website: website || null,
        team_size: team_size || null,
        revenue: revenue || null,
        source: source || null,
        completed_at: new Date(),
      },
      create: {
        user_id,
        goal,
        website: website || null,
        team_size: team_size || null,
        revenue: revenue || null,
        source: source || null,
        completed_at: new Date(),
      },
    })

    return NextResponse.json(
      { success: true, onboarding },
      { status: 200 }
    )
  } catch (error) {
    console.error("Onboarding error details:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { 
        error: "Failed to save onboarding data",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
