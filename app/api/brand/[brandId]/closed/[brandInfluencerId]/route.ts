import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// mapping
function mapColumnToDb(column: string) {
  switch (column) {
    case "For Order Creation":
      return {
        contact_status: "for_order_creation",
        stage: 5,
        order_status: null,
        shipped_at: null,
        delivered_at: null,
        content_posted: false,
        posted_at: null,
      }

    case "In-Transit":
      return {
        contact_status: "for_order_creation",
        stage: 6,
        order_status: "shipped",
        shipped_at: new Date(),
      }

    case "Delivered":
      return {
        contact_status: "for_order_creation",
        stage: 7,
        order_status: "delivered",
        delivered_at: new Date(),
      }

    case "Posted":
      return {
        contact_status: "for_order_creation",
        stage: 8,
        content_posted: true,
        posted_at: new Date(),
      }

    case "No post":
      return {
        contact_status: "for_order_creation",
        stage: 8,
        content_posted: false,
      }

    default:
      return {}
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { brandId: string; brandInfluencerId: string } } // ✅ FIXED
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { brandId, brandInfluencerId } = params // ✅ NO await

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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { closedStatus, paidCollabData, campaignType } = body

    const record = await prisma.brandInfluencer.findUnique({
      where: { id: brandInfluencerId },
    })

    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // parse product_details
    let productDetails: any = {}
    if (record.product_details) {
      try {
        productDetails = JSON.parse(record.product_details)
      } catch {
        productDetails = {}
      }
    }

    // merge updates
    if (closedStatus) productDetails.closedStatus = closedStatus
    if (paidCollabData) productDetails.paidCollab = paidCollabData
    if (campaignType) productDetails.campaignType = campaignType

    const mapped = closedStatus ? mapColumnToDb(closedStatus) : {}

    const updated = await prisma.brandInfluencer.update({
      where: { id: brandInfluencerId },
      data: {
        ...mapped,
        product_details: JSON.stringify(productDetails),
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}