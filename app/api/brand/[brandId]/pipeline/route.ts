// app/api/brand/[brandId]/pipeline/route.ts
// FIXED: includes Not Interested (Declined) and For Order Creation (stage 5)
// so they persist on refresh instead of disappearing

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function derivePipelineStatus(
  contactStatus: string,
  stage: number | null,
  approvalStatus: string | null
): string {
  // ── Hard exits ────────────────────────────────────────────────────────────
  if (contactStatus === "not_interested" || approvalStatus === "Declined") {
    return "Not Interested"
  }

  // ── For Order Creation (moved to Post Tracker but still visible here) ─────
  if (contactStatus === "for_order_creation" || (stage !== null && stage >= 5)) {
    return "For Order Creation"
  }

  // ── Standard pipeline stages (stage-based, with contact_status fallback) ──
  if (stage !== null) {
    if (stage === 4) return "Deal Agreed"
    if (stage === 3) return "In Conversation"
    if (stage === 2) return "Contacted"
    if (stage === 1) return "For Outreach"
  }

  // ── contact_status fallback (when stage is NULL) ──────────────────────────
  switch (contactStatus) {
    case "agreed":
    case "for_order_creation": return "Deal Agreed"
    case "negotiating":
    case "paid_collab":        return "In Conversation"
    case "responded":
    case "replied":
    case "contacted":          return "Contacted"
    case "no_response":
    case "email_error":        return "Contacted"
    case "pending":
    default:                   return "For Outreach"
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

    if (!brand.is_active) {
      return NextResponse.json({ error: "This workspace is unavailable." }, { status: 403 })
    }

    // ── FIXED QUERY ───────────────────────────────────────────────────────────
    // Previously: approval_status: "Approved" ONLY
    //   → NI cards (Declined) vanished on refresh
    //   → For Order Creation (stage 5) vanished on refresh
    //
    // Now: include ALL records that belong in the pipeline view:
    //   1. Approved (normal pipeline cards)
    //   2. Declined / not_interested (show in Not Interested column)
    //   3. for_order_creation / stage >= 5 (show in For Order Creation column,
    //      also visible in Post Tracker — dual visibility is intentional)
    const brandInfluencers = await prisma.brandInfluencer.findMany({
      where: {
        brand_id: brandId,
        OR: [
          // Standard approved pipeline members
          { approval_status: "Approved" },
          // Not Interested — keep visible in NI column
          { approval_status: "Declined" },
          { contact_status: "not_interested" },
          // For Order Creation / moved to Post Tracker
          { contact_status: "for_order_creation" },
          { stage: { gte: 5 } },
        ],
      },
      include: {
        influencer: true,
        campaign: { select: { id: true, name: true } },
      },
      orderBy: { created_at: "asc" },
    })

    // Filter out records where influencer is null (orphaned records)
    const validBrandInfluencers = brandInfluencers.filter(bi => bi.influencer !== null)

    const data = validBrandInfluencers.map((bi) => {
      const inf = bi.influencer

      const pipelineStatus = derivePipelineStatus(
        bi.contact_status,
        bi.stage,
        bi.approval_status
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

        followers:       formatFollowers(inf.follower_count),
        followerCount:   inf.follower_count,
        engagementRate:  inf.engagement_rate
          ? `${Number(inf.engagement_rate).toFixed(1)}%`
          : "0%",

        niche:           inf.niche            || "",
        location:        inf.location         || "",
        email:           inf.email            || "",
        profileImageUrl: inf.profile_image_url || null,
        bio:             inf.bio              || "",

        pipelineStatus,

        contactStatus:   bi.contact_status,
        stage:           bi.stage,
        orderStatus:     bi.order_status,
        contentPosted:   bi.content_posted,
        approvalStatus:  bi.approval_status,
        // approval_notes holds the NI reason (set by PATCH route)
        approvalNotes:   bi.approval_notes,

        agreedRate:      bi.agreed_rate   ? Number(bi.agreed_rate)   : null,
        currency:        bi.currency,
        deliverables:    bi.deliverables,
        deadline:        bi.deadline      ? bi.deadline.toISOString()      : null,
        postUrl:         bi.post_url,
        likesCount:      bi.likes_count,
        commentsCount:   bi.comments_count,
        engagementCount: bi.engagement_count,
        postedAt:        bi.posted_at     ? bi.posted_at.toISOString()     : null,
        shippedAt:       bi.shipped_at    ? bi.shipped_at.toISOString()    : null,
        deliveredAt:     bi.delivered_at  ? bi.delivered_at.toISOString()  : null,
        productDetails:  bi.product_details,
        notes:           bi.notes         || "",
        internalRating:  bi.internal_rating ? Number(bi.internal_rating)  : null,
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