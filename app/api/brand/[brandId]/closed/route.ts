// app/api/brand/[brandId]/closed/route.ts

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type ClosedColumn =
  | "For Order Creation"
  | "In-Transit"
  | "Delivered"
  | "Posted"
  | "No post"

function deriveClosedStatus(
  contactStatus: string,
  stage: number,
  orderStatus: string | null,
  contentPosted: boolean,
  approvalStatus: string | null
): ClosedColumn {
  // 1. Hard exits
  if (approvalStatus === "Declined" || contactStatus === "not_interested") {
    return "No post"
  }

  // 2. Content done
  if (contentPosted) {
    return "Posted"
  }

  // 3. Order status priority
  if (orderStatus === "delivered") return "Delivered"
  if (orderStatus === "shipped") return "In-Transit"
  if (orderStatus === "pending") return "For Order Creation"

  // 4. Stage logic (FIXED ORDER)
  if (stage >= 4) return "Delivered"
  if (stage >= 3) return "In-Transit"

  if (
    stage >= 5 ||
    contactStatus === "for_order_creation" ||
    contactStatus === "agreed"
  ) {
    return "For Order Creation"
  }

  return "For Order Creation"
}

function safeJSONParse(value: string | null) {
  if (!value) return {}
  try {
    return JSON.parse(value)
  } catch (err) {
    console.error("Invalid JSON in product_details:", value)
    return {}
  }
}

function formatFollowers(n: number): string {
  if (!n) return "0"
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K"
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

    // Access check
    const brand = await prisma.brand.findFirst({
      where: {
        id: brandId,
        OR: [
          { owner_id: session.user.id },
          { members: { some: { user_id: session.user.id } } },
        ],
      },
      select: { id: true },
    })

    if (!brand) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch data
    const rows = await prisma.brandInfluencer.findMany({
      where: {
        brand_id: brandId,
        OR: [
          { approval_status: "Approved" },
          { approval_status: "Declined" },
          { contact_status: "not_interested" },
        ],
      },
      include: {
        influencer: true,
        campaign: true,
      },
      orderBy: {
        updated_at: "desc",
      },
    })

    // Transform
    const data = rows.map((row) => {
      const productDetails = safeJSONParse(row.product_details)
      const inf = row.influencer

      return {
        id: row.id,
        influencerId: row.influencer_id,
        campaignId: row.campaign_id,
        campaignName: row.campaign?.name || null,

        influencer: inf?.full_name || inf?.handle || "Unknown",
        handle: inf?.handle || "",

        platform: inf?.platform
          ? inf.platform.charAt(0).toUpperCase() + inf.platform.slice(1)
          : "Instagram",

        followers: formatFollowers(inf?.follower_count || 0),
        followerCount: inf?.follower_count || 0,

        engagementRate: inf?.engagement_rate
          ? `${Number(inf.engagement_rate).toFixed(1)}%`
          : "0%",

        niche: inf?.niche || "",
        location: inf?.location || "",
        email: inf?.email || "",
        profileImageUrl: inf?.profile_image_url || null,
        bio: inf?.bio || "",

        closedStatus: deriveClosedStatus(
          row.contact_status,
          row.stage,
          row.order_status,
          row.content_posted,
          row.approval_status
        ),

        contactStatus: row.contact_status,
        stage: row.stage,
        orderStatus: row.order_status,
        contentPosted: row.content_posted,
        approvalStatus: row.approval_status,
        approvalNotes: row.approval_notes || "",

        agreedRate: row.agreed_rate,
        currency: row.currency,
        deliverables: row.deliverables,
        deadline: row.deadline?.toISOString() || null,
        notes: row.notes || "",

        campaignType: productDetails.campaignType || null,
        productDetails: row.product_details,

        shippedAt: row.shipped_at?.toISOString() || null,
        deliveredAt: row.delivered_at?.toISOString() || null,
        trackingNumber: productDetails.trackingNumber || null,

        postUrl: row.post_url,
        postedAt: row.posted_at?.toISOString() || null,

        likesCount: row.likes_count || 0,
        commentsCount: row.comments_count || 0,
        engagementCount: row.engagement_count || 0,

        paidCollabData: productDetails.paidCollab || null,

        internalRating: row.internal_rating,
        lastContact: row.updated_at.toISOString(),
        createdAt: row.created_at.toISOString(),
      }
    })

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("GET closed error:", error)

    return NextResponse.json(
      { error: "Failed to fetch data", detail: error?.message },
      { status: 500 }
    )
  }
}