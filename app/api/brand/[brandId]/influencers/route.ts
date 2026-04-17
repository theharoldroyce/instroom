// app/api/brand/[brandId]/influencers/route.ts

import { prisma } from "@/lib/prisma"
import { canAddInfluencer } from "@/lib/subscription-limits"
import { userHasActiveSubscription } from "@/lib/subscription-limits"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

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

    const brand = await prisma.brand.findUnique({ where: { id: brandId } })
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    // Allow owner OR any brand member
    const isOwner = brand.owner_id === session.user.id
    const isMember = isOwner ? true : !!(await prisma.brandMember.findFirst({
      where: { brand_id: brandId, user_id: session.user.id }
    }))
    if (!isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Check if brand owner has active subscription - only for team members (not owner)
    if (!isOwner) {
      const ownerHasActiveSubscription = await userHasActiveSubscription(brand.owner_id)
      if (!ownerHasActiveSubscription) {
        return NextResponse.json(
          { error: "This workspace is unavailable. The workspace owner's subscription is inactive." },
          { status: 403 }
        )
      }
    }

    // Fetch BrandInfluencer rows without include to avoid Prisma throwing
    // on orphaned records (influencer deleted but link remains)
    const brandInfluencers = await prisma.brandInfluencer.findMany({
      where: { brand_id: brandId },
      orderBy: { created_at: "desc" },
    })

    // Fetch influencers separately so missing ones don't crash the query
    const influencerIds = [...new Set(brandInfluencers.map(bi => bi.influencer_id))]
    const influencers = await prisma.influencer.findMany({
      where: { id: { in: influencerIds } },
    })
    const influencerMap = new Map(influencers.map(i => [i.id, i]))

    const combined = brandInfluencers
      .filter((bi) => influencerMap.has(bi.influencer_id)) // skip orphaned links
      .map((bi) => {
        const inf = influencerMap.get(bi.influencer_id)!
        return {
          id: bi.id,
          brand_id: bi.brand_id,
          influencer_id: bi.influencer_id,
          campaign_id: bi.campaign_id,
          contact_status: bi.contact_status,
          outreach_method: bi.outreach_method,
          stage: bi.stage,
          order_status: bi.order_status,
          product_details: bi.product_details,
          shipped_at: bi.shipped_at?.toISOString() ?? null,
          delivered_at: bi.delivered_at?.toISOString() ?? null,
          content_posted: bi.content_posted,
          posted_at: bi.posted_at?.toISOString() ?? null,
          post_url: bi.post_url,
          post_caption: bi.post_caption,
          likes_count: bi.likes_count,
          comments_count: bi.comments_count,
          engagement_count: bi.engagement_count,
          agreed_rate: bi.agreed_rate ? bi.agreed_rate.toString() : null,
          currency: bi.currency,
          deliverables: bi.deliverables,
          deadline: bi.deadline?.toISOString() ?? null,
          notes: bi.notes,
          internal_rating: bi.internal_rating ? bi.internal_rating.toString() : null,
          approval_status: bi.approval_status,
          approval_notes: bi.approval_notes,
          transferred_date: bi.transferred_date?.toISOString() ?? null,
          created_at: bi.created_at.toISOString(),
          updated_at: bi.updated_at.toISOString(),
          influencer: {
            id: inf.id,
            handle: inf.handle,
            platform: inf.platform,
            full_name: inf.full_name,
            email: inf.email,
            gender: inf.gender,
            niche: inf.niche,
            location: inf.location,
            bio: inf.bio,
            profile_image_url: inf.profile_image_url,
            social_link: inf.social_link,
            follower_count: inf.follower_count,
            engagement_rate: inf.engagement_rate ? Number(inf.engagement_rate) : 0,
            avg_likes: inf.avg_likes,
            avg_comments: inf.avg_comments,
            avg_views: inf.avg_views,
            created_at: inf.created_at.toISOString(),
            updated_at: inf.updated_at.toISOString(),
          },
        }
      })

    return NextResponse.json({ influencers: combined }, { status: 200 })
  } catch (error) {
    console.error("GET /api/brand/[brandId]/influencers:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Failed to fetch influencers" }, { status: 500 })
  }
}

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

    const brand = await prisma.brand.findUnique({ where: { id: brandId } })
    if (!brand || brand.owner_id !== session.user.id) {
      return NextResponse.json({ error: "Brand not found or access denied" }, { status: 404 })
    }

    const limitCheck = await canAddInfluencer(session.user.id, brandId)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: limitCheck.message, current: limitCheck.current, max: limitCheck.max },
        { status: 403 }
      )
    }

    const influencer = await prisma.influencer.findUnique({ where: { id: influencer_id } })
    if (!influencer) {
      return NextResponse.json({ error: "Influencer not found" }, { status: 404 })
    }

    const existing = await prisma.brandInfluencer.findUnique({
      where: { brand_id_influencer_id: { brand_id: brandId, influencer_id } },
    })
    if (existing) {
      return NextResponse.json({ error: "This influencer is already added to your brand" }, { status: 409 })
    }

    const brandInfluencer = await prisma.brandInfluencer.create({
      data: { brand_id: brandId, influencer_id, contact_status: "not_contacted" },
      include: { influencer: true },
    })

    return NextResponse.json({ influencer: brandInfluencer }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add influencer", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}