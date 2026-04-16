// app/api/brand/[brandId]/pipeline/route.ts

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { userHasActiveSubscription } from "@/lib/subscription-limits"

function derivePipelineStatus(
  contactStatus: string,
  stage: number,
  orderStatus: string | null,
  contentPosted: boolean
): string {
  if (contentPosted || stage >= 5) return "Posted"
  if (orderStatus === "delivered" || stage >= 4) return "Delivered"
  if (orderStatus === "shipped"   || stage >= 3) return "In-Transit"
  if (stage >= 2 || contactStatus === "agreed")  return "For Order Creation"

  switch (contactStatus) {
    case "pending":          return "For Outreach"
    case "contacted":        return "Contacted"
    case "responded":
    case "replied":          return "Replied"
    case "negotiating":
    case "paid_collab":      return "In-Progress"
    case "not_interested":   return "Not Interested"   // ← stays in pipeline, just in NI column
    case "no_response":
    case "email_error":      return "Contacted"
    case "agreed":           return "For Order Creation"
    default:                 return "For Outreach"
  }
}

function formatFollowers(n: number): string {
  if (!n) return "0"
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K"
  return String(n)
}

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

    const brand = await prisma.brand.findFirst({
      where: {
        id: brandId,
        OR: [
          { owner_id: session.user.id },
          { members: { some: { user_id: session.user.id } } },
        ],
      },
    })

    if (!brand) {
      return NextResponse.json({ error: "Brand not found or access denied" }, { status: 403 })
    }

    // Check if brand owner has active subscription
    const ownerHasActiveSubscription = await userHasActiveSubscription(brand.owner_id)
    if (!ownerHasActiveSubscription) {
      return NextResponse.json(
        { error: "This workspace is unavailable. The workspace owner's subscription is inactive." },
        { status: 403 }
      )
    }

    // Only fetch Approved influencers for the pipeline
    const brandInfluencers = await prisma.brandInfluencer.findMany({
      where: {
        brand_id: brandId,
        approval_status: "Approved",
      },
      include: {
        influencer: true,
        campaign: { select: { id: true, name: true } },
      },
      orderBy: { created_at: "asc" },
    })

    const data = brandInfluencers.map((bi) => {
      const inf = bi.influencer
      const pipelineStatus = derivePipelineStatus(
        bi.contact_status,
        bi.stage,
        bi.order_status,
        bi.content_posted
      )

      return {
        id:            bi.id,
        influencerId:  inf.id,
        campaignId:    bi.campaign_id,
        campaignName:  bi.campaign?.name ?? null,

        influencer:      inf.full_name || inf.handle,
        instagramHandle: inf.platform === "instagram" ? `@${inf.handle}` : inf.handle,
        handle:          inf.handle,
        platform:        inf.platform.charAt(0).toUpperCase() + inf.platform.slice(1),

        followers:      formatFollowers(inf.follower_count),
        followerCount:  inf.follower_count,
        engagementRate: inf.engagement_rate
          ? `${Number(inf.engagement_rate).toFixed(1)}%`
          : "0%",

        niche:           inf.niche    || "",
        location:        inf.location || "",
        email:           inf.email    || "",
        profileImageUrl: inf.profile_image_url || null,
        bio:             inf.bio      || "",

        pipelineStatus,

        contactStatus:   bi.contact_status,
        stage:           bi.stage,
        orderStatus:     bi.order_status,
        contentPosted:   bi.content_posted,
        approvalStatus:  bi.approval_status,   // still "Approved"
        approvalNotes:   bi.approval_notes,    // contains the NI reason
        agreedRate:      bi.agreed_rate  ? Number(bi.agreed_rate) : null,
        currency:        bi.currency,
        deliverables:    bi.deliverables,
        deadline:        bi.deadline     ? bi.deadline.toISOString()     : null,
        postUrl:         bi.post_url,
        likesCount:      bi.likes_count,
        commentsCount:   bi.comments_count,
        engagementCount: bi.engagement_count,
        postedAt:        bi.posted_at    ? bi.posted_at.toISOString()    : null,
        shippedAt:       bi.shipped_at   ? bi.shipped_at.toISOString()   : null,
        deliveredAt:     bi.delivered_at ? bi.delivered_at.toISOString() : null,
        productDetails:  bi.product_details,
        notes:           bi.notes        || "",   // contains the NI reason
        internalRating:  bi.internal_rating ? Number(bi.internal_rating) : null,
        lastContact:     bi.updated_at.toISOString(),
        createdAt:       bi.created_at.toISOString(),
      }
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error("GET /api/brands/[brandId]/pipeline error:", error)
    return NextResponse.json({ error: "Failed to fetch pipeline data" }, { status: 500 })
  }
}