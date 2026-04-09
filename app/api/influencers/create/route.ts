import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { canAddInfluencer } from "@/lib/subscription-limits"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    // Validate required fields
    if (!data.handle || !data.platform) {
      return NextResponse.json(
        { error: "handle and platform are required" },
        { status: 400 }
      )
    }

    // Check for duplicate handle+platform combination
    const existing = await prisma.influencer.findUnique({
      where: {
        handle_platform: {
          handle: data.handle,
          platform: data.platform,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Influencer with this handle and platform already exists" },
        { status: 409 }
      )
    }

    // If brandId is provided, check influencer limit BEFORE creating the influencer
    if (data.brandId) {
      const limitCheck = await canAddInfluencer(session.user.id, data.brandId)
      if (!limitCheck.allowed) {
        return NextResponse.json(
          {
            error: limitCheck.message || "Influencer limit reached",
            current: limitCheck.current,
            max: limitCheck.max,
          },
          { status: 403 }
        )
      }
    }

    // Create influencer
    const influencer = await prisma.influencer.create({
      data: {
        handle: data.handle,
        platform: data.platform,
        full_name: data.full_name || null,
        email: data.email || null,
        gender: data.gender || null,
        niche: data.niche || null,
        location: data.location || null,
        bio: data.bio || null,
        profile_image_url: data.profile_image_url || null,
        social_link: data.social_link || null,
        follower_count: data.follower_count || 0,
        engagement_rate: data.engagement_rate || 0,
        avg_likes: data.avg_likes || 0,
        avg_comments: data.avg_comments || 0,
        avg_views: data.avg_views || 0,
      },
    })

    // If brandId is provided, link influencer to brand
    if (data.brandId) {
      await prisma.brandInfluencer.create({
        data: {
          brand_id: data.brandId,
          influencer_id: influencer.id,
          contact_status: "not_contacted",
          stage: 1,
        },
      })
    }

    return NextResponse.json(influencer, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create influencer" },
      { status: 500 }
    )
  }
}
