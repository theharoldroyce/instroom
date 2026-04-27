// app/api/brand/[brandId]/pipeline/[brandInfluencerId]/route.ts

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function pipelineStatusToFields(
  pipelineStatus: string
): {
  contact_status: string
  stage: number
  approval_status?: string
} {
  switch (pipelineStatus) {
    case "For Outreach":
      return { contact_status: "pending", stage: 1 }

    case "Contacted":
      return { contact_status: "contacted", stage: 2 }

    case "In Conversation":
      return { contact_status: "negotiating", stage: 3 }

    case "Deal Agreed":
      return { contact_status: "agreed", stage: 4 }

    case "For Order Creation":
      return {
        contact_status: "for_order_creation",
        stage: 5,
        approval_status: "Approved",
      }

    case "Not Interested":
      return {
        contact_status: "not_interested",
        stage: 0,
        approval_status: "Declined",
      }

    default:
      return { contact_status: "pending", stage: 1 }
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

    // ✅ Auth check
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
    const { pipelineStatus, niReason } = body

    if (!pipelineStatus) {
      return NextResponse.json(
        { error: "pipelineStatus is required" },
        { status: 400 }
      )
    }

    const fields = pipelineStatusToFields(pipelineStatus)

    const updated = await prisma.brandInfluencer.update({
      where: { id: brandInfluencerId },
      data: {
        contact_status: fields.contact_status,
        stage: fields.stage,

        // ✅ FINAL FIX (auto fallback if missing)
      approval_status:
        fields.approval_status ??
        (pipelineStatus !== "Not Interested" ? "Approved" : "Declined"),

        // ✅ only for Not Interested
        ...(pipelineStatus === "Not Interested"
          ? {
              approval_notes: niReason || "Not interested",
            }
          : {}),
      },
      select: {
        id: true,
        contact_status: true,
        stage: true,
        approval_status: true,
      },
    })

    return NextResponse.json({ success: true, data: updated })

  } catch (error: unknown) {
    const e = error as { code?: string; message?: string }

    console.error("PATCH pipeline error:", e?.code, e?.message)

    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    return NextResponse.json(
      { error: "Failed to update status", detail: e?.message },
      { status: 500 }
    )
  }
}