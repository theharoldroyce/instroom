import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// ─── Mapping ────────────────────────────────────────────────────────────────
function closedStatusToFields(
  closedStatus: string,
  current: {
    shipped_at: Date | null
    delivered_at: Date | null
    posted_at: Date | null
  }
) {
  switch (closedStatus) {
    case "For Order Creation":
      return { stage: 2, order_status: "pending" }

    case "In-Transit":
      return {
        stage: 3,
        order_status: "shipped",
        shipped_at: current.shipped_at ?? new Date(),
      }

    case "Delivered":
      return {
        stage: 4,
        order_status: "delivered",
        delivered_at: current.delivered_at ?? new Date(),
      }

    case "Posted":
      return {
        stage: 5,
        content_posted: true,
        posted_at: current.posted_at ?? new Date(),
      }

    case "Completed":
      return {
        stage: 5,
        content_posted: true,
      }

    default:
      return { stage: 2 }
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string; brandInfluencerId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { brandId, brandInfluencerId } = await params

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
      return NextResponse.json({ error: "Not found" }, { status: 403 })
    }

    const body = await req.json()
    const { closedStatus, paidCollabData, campaignType } = body

    if (!closedStatus && !paidCollabData && campaignType === undefined) {
      return NextResponse.json(
        { error: "closedStatus, paidCollabData, or campaignType is required" },
        { status: 400 }
      )
    }

    // ✅ Get current values
    const current = await prisma.brandInfluencer.findUnique({
      where: { id: brandInfluencerId },
      select: {
        product_details: true,
        shipped_at: true,
        delivered_at: true,
        posted_at: true,
      },
    })

    if (!current) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    // ── Parse JSON safely ─────────────────────────────────────────────
    let blob: Record<string, unknown> = {}

    if (current.product_details) {
      try {
        blob = JSON.parse(current.product_details)
      } catch {
        blob = { legacyProductDetails: current.product_details }
      }
    }

    // ── Merge updates ────────────────────────────────────────────────
    if (closedStatus) blob.closedStatus = closedStatus
    if (paidCollabData !== undefined) blob.paidCollab = paidCollabData
    if (campaignType !== undefined) blob.campaignType = campaignType

    // ── Map status to DB ─────────────────────────────────────────────
    const dbFields = closedStatus
      ? closedStatusToFields(closedStatus, {
          shipped_at: current.shipped_at,
          delivered_at: current.delivered_at,
          posted_at: current.posted_at,
        })
      : null

    const updated = await prisma.brandInfluencer.update({
      where: { id: brandInfluencerId },
      data: {
        product_details: JSON.stringify(blob),

        ...(dbFields && {
          stage: dbFields.stage,
          contact_status: "agreed",

          ...(dbFields.order_status && {
            order_status: dbFields.order_status,
          }),

          ...(dbFields.content_posted !== undefined && {
            content_posted: dbFields.content_posted,
          }),

          ...(dbFields.posted_at && {
            posted_at: dbFields.posted_at,
          }),

          ...(dbFields.shipped_at && {
            shipped_at: dbFields.shipped_at,
          }),

          ...(dbFields.delivered_at && {
            delivered_at: dbFields.delivered_at,
          }),
        }),
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    console.error("PATCH closed error:", error)

    return NextResponse.json(
      { error: "Failed to update", detail: error?.message },
      { status: 500 }
    )
  }
}