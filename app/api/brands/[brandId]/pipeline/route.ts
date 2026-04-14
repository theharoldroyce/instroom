// ─── app/api/brands/[brandId]/pipeline/route.ts ─────────────────────────────
// Uses raw SQL with INNER JOIN to skip orphaned BrandInfluencer rows
// that reference deleted Influencer records (avoids Prisma crash).

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// ─── Pipeline status derivation ─────────────────────────────────────────────
function derivePipelineStatus(bi: {
  contact_status: string
  stage: number
  order_status: string | null
  content_posted: boolean
}): string {
  if (bi.content_posted || bi.stage === 5) return "Posted"
  if (bi.order_status === "delivered") return "Delivered"
  if (bi.order_status === "shipped") return "In-Transit"
  if (bi.order_status === "pending") return "For Order Creation"
  if (bi.contact_status === "not_contacted") return "For Outreach"
  if (bi.contact_status === "contacted") return "Contacted"
  if (bi.contact_status === "interested") return "Replied"
  if (bi.contact_status === "agreed") {
    if (!bi.order_status || bi.order_status === "not_sent") return "In-Progress"
    return "For Order Creation"
  }
  if (bi.contact_status === "not_interested") return "Not Interested"

  switch (bi.stage) {
    case 1: return "For Outreach"
    case 2: return "Contacted"
    case 3: return "In-Progress"
    case 4: return "For Order Creation"
    default: return "For Outreach"
  }
}

// ─── Reverse mapping (for PATCH updates) ────────────────────────────────────
export function pipelineStatusToDbFields(pipelineStatus: string) {
  switch (pipelineStatus) {
    case "For Outreach":       return { contact_status: "not_contacted", stage: 1 }
    case "Contacted":          return { contact_status: "contacted", stage: 2 }
    case "Replied":            return { contact_status: "interested", stage: 2 }
    case "In-Progress":        return { contact_status: "agreed", stage: 3 }
    case "Not Interested":     return { contact_status: "not_interested", stage: 2 }
    case "For Order Creation": return { contact_status: "agreed", stage: 3, order_status: "pending" }
    case "In-Transit":         return { contact_status: "agreed", stage: 4, order_status: "shipped" }
    case "Delivered":          return { contact_status: "agreed", stage: 4, order_status: "delivered" }
    case "Posted":             return { contact_status: "agreed", stage: 5, content_posted: true }
    case "Completed":          return { contact_status: "agreed", stage: 5, content_posted: true }
    default:                   return { contact_status: "not_contacted", stage: 1 }
  }
}

function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
  return count.toString()
}

// ─── GET ────────────────────────────────────────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params

    console.log("[Pipeline API] GET for brand:", brandId)

    // Verify brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: { id: true, name: true },
    })

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    // ── Raw SQL with INNER JOIN — automatically skips orphaned rows ──────
    // INNER JOIN only returns rows where the Influencer record EXISTS
    const rows: any[] = await prisma.$queryRaw`
      SELECT
        bi.id,
        bi.brand_id,
        bi.influencer_id,
        bi.campaign_id,
        bi.contact_status,
        bi.stage,
        bi.order_status,
        bi.content_posted,
        bi.post_url,
        bi.likes_count,
        bi.comments_count,
        bi.engagement_count,
        bi.posted_at,
        bi.agreed_rate,
        bi.currency,
        bi.deliverables,
        bi.deadline,
        bi.notes,
        bi.internal_rating,
        bi.created_at,
        bi.updated_at,
        i.handle AS inf_handle,
        i.platform AS inf_platform,
        i.full_name AS inf_full_name,
        i.email AS inf_email,
        i.bio AS inf_bio,
        i.follower_count AS inf_follower_count,
        i.engagement_rate AS inf_engagement_rate,
        i.niche AS inf_niche,
        c.id AS campaign_record_id,
        c.name AS campaign_name
      FROM BrandInfluencer bi
      INNER JOIN Influencer i ON i.id = bi.influencer_id
      LEFT JOIN Campaign c ON c.id = bi.campaign_id
      WHERE bi.brand_id = ${brandId}
      ORDER BY bi.created_at DESC
    `

    console.log("[Pipeline API] Found", rows.length, "influencers for", brand.name)

    const pipelineData = rows.map((r) => {
      const rawHandle = String(r.inf_handle || "")
      const handle = rawHandle.replace(/^@/, "")
      const fullName = r.inf_full_name || handle
      const followerCount = Number(r.inf_follower_count) || 0

      return {
        id: r.id,
        influencerId: r.influencer_id,
        campaignId: r.campaign_id,
        campaignName: r.campaign_name || null,

        influencer: fullName,
        instagramHandle: rawHandle.startsWith("@") ? rawHandle : `@${handle}`,
        handle,
        platform:
          r.inf_platform
            ? r.inf_platform.charAt(0).toUpperCase() + r.inf_platform.slice(1)
            : "Instagram",
        followers: formatFollowers(followerCount),
        followerCount,
        engagementRate: `${Number(r.inf_engagement_rate || 0).toFixed(1)}%`,
        niche: r.inf_niche || "",
        location: "",
        email: r.inf_email || "",
        profileImageUrl: null,
        bio: r.inf_bio || "",

        pipelineStatus: derivePipelineStatus({
          contact_status: r.contact_status || "not_contacted",
          stage: Number(r.stage) || 1,
          order_status: r.order_status,
          content_posted: Boolean(r.content_posted),
        }),

        contactStatus: r.contact_status,
        stage: Number(r.stage) || 1,
        orderStatus: r.order_status,
        contentPosted: Boolean(r.content_posted),
        approvalStatus: null,

        agreedRate: r.agreed_rate ? Number(r.agreed_rate) : null,
        currency: r.currency,
        deliverables: r.deliverables,
        deadline: r.deadline,

        postUrl: r.post_url,
        likesCount: Number(r.likes_count) || 0,
        commentsCount: Number(r.comments_count) || 0,
        engagementCount: Number(r.engagement_count) || 0,
        postedAt: r.posted_at,

        notes: r.notes || "",
        internalRating: r.internal_rating ? Number(r.internal_rating) : null,

        lastContact: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }
    })

    return NextResponse.json({
      data: pipelineData,
      total: pipelineData.length,
      brandId,
    })
  } catch (error: any) {
    console.error("[Pipeline API] ERROR:", error.message)
    console.error("[Pipeline API] Stack:", error.stack)

    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    )
  }
}