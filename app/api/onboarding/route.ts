import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { goal, website, team_size, revenue, source, user_id } = await req.json()

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }
    
    const userExists = await prisma.user.findUnique({
      where: { id: user_id },
    })
    if (!userExists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

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
    return NextResponse.json(
      { 
        error: "Failed to save onboarding data",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
