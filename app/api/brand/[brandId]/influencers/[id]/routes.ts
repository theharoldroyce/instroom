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
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { brandId } = await params

    // Verify user owns this brand
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    })

    if (!brand || brand.owner_id !== session.user.id) {
      return NextResponse.json({ error: "Brand not found or access denied" }, { status: 404 })
    }

    // Fetch all BrandInfluencer records
    const brandInfluencers = await prisma.brandInfluencer.findMany({
      where: { brand_id: brandId },
      orderBy: { created_at: "desc" },
    })

    // Get all associated Influencer records
    const influencerIds = [...new Set(brandInfluencers.map(bi => bi.influencer_id))]
    const influencers = await prisma.influencer.findMany({
      where: { id: { in: influencerIds } },
    })

    // Combine data and filter out orphaned records
    const influencerMap = new Map(influencers.map(i => [i.id, i]))
    const combined = brandInfluencers
      .map(bi => ({
        ...bi,
        influencer: influencerMap.get(bi.influencer_id) || null,
      }))
      .filter(bi => bi.influencer)

    return NextResponse.json({ influencers: combined }, { status: 200 })
  } catch (error) {
    console.error("Error fetching brand influencers:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Failed to fetch influencers" },
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
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { brandId } = await params
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

/**
 * PUT /api/brand/[brandId]/influencers/[id]
 * Update both Influencer and BrandInfluencer records
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string; id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { brandId, id } = await params

    // Verify user owns this brand
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    })

    if (!brand || brand.owner_id !== session.user.id) {
      return NextResponse.json({ error: "Brand not found or access denied" }, { status: 404 })
    }

    const data = await req.json()

    // Separate fields by table
    // NOTE: handle and platform are IMMUTABLE - they have a unique constraint and cannot be updated
    const influencerUpdateData: any = {}
    if (data.full_name !== undefined) influencerUpdateData.full_name = data.full_name
    if (data.email !== undefined) influencerUpdateData.email = data.email
    if (data.gender !== undefined) influencerUpdateData.gender = data.gender
    if (data.niche !== undefined) influencerUpdateData.niche = data.niche
    if (data.location !== undefined) influencerUpdateData.location = data.location
    if (data.bio !== undefined) influencerUpdateData.bio = data.bio
    if (data.profile_image_url !== undefined) influencerUpdateData.profile_image_url = data.profile_image_url
    if (data.social_link !== undefined) influencerUpdateData.social_link = data.social_link
    if (data.follower_count !== undefined) influencerUpdateData.follower_count = Number(data.follower_count)
    if (data.engagement_rate !== undefined) influencerUpdateData.engagement_rate = Number(data.engagement_rate)
    if (data.avg_likes !== undefined) influencerUpdateData.avg_likes = Number(data.avg_likes)
    if (data.avg_comments !== undefined) influencerUpdateData.avg_comments = Number(data.avg_comments)
    if (data.avg_views !== undefined) influencerUpdateData.avg_views = Number(data.avg_views)

    const brandInfluencerUpdateData: any = {}
    if (data.contact_status !== undefined) brandInfluencerUpdateData.contact_status = data.contact_status
    if (data.outreach_method !== undefined) brandInfluencerUpdateData.outreach_method = data.outreach_method
    if (data.stage !== undefined) brandInfluencerUpdateData.stage = Number(data.stage)
    if (data.order_status !== undefined) brandInfluencerUpdateData.order_status = data.order_status
    if (data.product_details !== undefined) brandInfluencerUpdateData.product_details = data.product_details
    if (data.content_posted !== undefined) brandInfluencerUpdateData.content_posted = data.content_posted === true || data.content_posted === "true"
    if (data.post_url !== undefined) brandInfluencerUpdateData.post_url = data.post_url
    if (data.post_caption !== undefined) brandInfluencerUpdateData.post_caption = data.post_caption
    if (data.likes_count !== undefined) brandInfluencerUpdateData.likes_count = Number(data.likes_count)
    if (data.comments_count !== undefined) brandInfluencerUpdateData.comments_count = Number(data.comments_count)
    if (data.engagement_count !== undefined) brandInfluencerUpdateData.engagement_count = Number(data.engagement_count)
    if (data.agreed_rate !== undefined) brandInfluencerUpdateData.agreed_rate = data.agreed_rate ? Number(data.agreed_rate) : null
    if (data.currency !== undefined) brandInfluencerUpdateData.currency = data.currency
    if (data.deliverables !== undefined) brandInfluencerUpdateData.deliverables = data.deliverables
    if (data.notes !== undefined) brandInfluencerUpdateData.notes = data.notes
    if (data.internal_rating !== undefined) brandInfluencerUpdateData.internal_rating = data.internal_rating ? Number(data.internal_rating) : null
    if (data.approval_status !== undefined) brandInfluencerUpdateData.approval_status = data.approval_status
    if (data.approval_notes !== undefined) brandInfluencerUpdateData.approval_notes = data.approval_notes
    if (data.transferred_date !== undefined) brandInfluencerUpdateData.transferred_date = data.transferred_date ? new Date(data.transferred_date) : null

    // Update both tables if needed
    if (Object.keys(influencerUpdateData).length > 0) {
      await prisma.influencer.update({
        where: { id },
        data: influencerUpdateData,
      })
    }

    if (Object.keys(brandInfluencerUpdateData).length > 0) {
      await prisma.brandInfluencer.update({
        where: {
          brand_id_influencer_id: {
            brand_id: brandId,
            influencer_id: id,
          },
        },
        data: brandInfluencerUpdateData,
      })
    }

    // Return updated records
    const updatedInfluencer = await prisma.influencer.findUnique({
      where: { id },
    })

    const updatedBrandInfluencer = await prisma.brandInfluencer.findUnique({
      where: {
        brand_id_influencer_id: {
          brand_id: brandId,
          influencer_id: id,
        },
      },
    })

    return NextResponse.json({
      influencer: updatedInfluencer,
      brandInfluencer: updatedBrandInfluencer,
    })
  } catch (error) {
    console.error("Error updating brand influencer:", error)

    if (error instanceof Error) {
      console.error(`Error message: ${error.message}`)
      console.error(`Error stack: ${error.stack}`)
    }

    const errorMessage = error instanceof Error ? error.message : String(error)
    const isConnectionError = errorMessage.includes("ECONNREFUSED") || errorMessage.includes("connection")

    let statusCode = 500
    let detailedError = errorMessage

    if (isConnectionError) {
      statusCode = 503
      detailedError = "Database connection error. Please try again."
    }

    return NextResponse.json(
      {
        error: "Failed to update influencer",
        details: detailedError,
        type: isConnectionError ? "CONNECTION_ERROR" : "UPDATE_ERROR"
      },
      { status: statusCode }
    )
  }
}