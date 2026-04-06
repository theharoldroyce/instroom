import { prisma } from "@/lib/prisma"
import { canAddInfluencer } from "@/lib/subscription-limits"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/brand/[brandId]/influencers
 * Fetch all influencers for a specific brand
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { brandId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { brandId } = params

    // Verify user owns this brand
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    })

    if (!brand || brand.owner_id !== session.user.id) {
      return NextResponse.json({ error: "Brand not found or access denied" }, { status: 404 })
    }

    // Fetch all brand influencers with related influencer data
    const brandInfluencers = await prisma.brandInfluencer.findMany({
      where: { brand_id: brandId },
      include: {
        influencer: true,
        campaign: true,
      },
      orderBy: { created_at: "desc" },
    })

    return NextResponse.json({ influencers: brandInfluencers }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch influencers", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

/**
 * POST /api/brand/[brandId]/influencers
 * Add an influencer to a brand (with limit enforcement)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { brandId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { brandId } = params
    const body = await req.json()
    const { influencer_id } = body

    if (!influencer_id) {
      return NextResponse.json({ error: "influencer_id is required" }, { status: 400 })
    }

    // Verify user owns this brand
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    })

    if (!brand || brand.owner_id !== session.user.id) {
      return NextResponse.json({ error: "Brand not found or access denied" }, { status: 404 })
    }

    // Check influencer limit
    const limitCheck = await canAddInfluencer(session.user.id, brandId)

    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: limitCheck.message,
          current: limitCheck.current,
          max: limitCheck.max,
        },
        { status: 403 }
      )
    }

    // Verify influencer exists
    const influencer = await prisma.influencer.findUnique({
      where: { id: influencer_id },
    })

    if (!influencer) {
      return NextResponse.json({ error: "Influencer not found" }, { status: 404 })
    }

    // Check if already added to this brand
    const existing = await prisma.brandInfluencer.findUnique({
      where: {
        brand_id_influencer_id: {
          brand_id: brandId,
          influencer_id,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "This influencer is already added to your brand" },
        { status: 409 }
      )
    }

    // Add influencer to brand
    const brandInfluencer = await prisma.brandInfluencer.create({
      data: {
        brand_id: brandId,
        influencer_id,
        contact_status: "not_contacted",
      },
      include: {
        influencer: true,
      },
    })

    return NextResponse.json({ influencer: brandInfluencer }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add influencer", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
