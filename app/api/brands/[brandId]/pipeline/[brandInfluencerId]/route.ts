// ─── app/api/brands/[brandId]/pipeline/[brandInfluencerId]/route.ts ──────────
// PATCH: Update a BrandInfluencer's pipeline status (drag-and-drop / dropdown)

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { pipelineStatusToDbFields } from "../route"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string; brandInfluencerId: string }> }
) {
  try {
    const { brandId, brandInfluencerId } = await params

    console.log("[Pipeline PATCH]", { brandId, brandInfluencerId })

    const body = await request.json()
    const { pipelineStatus, notes, approvalStatus } = body

    // Build update payload
    const updateData: Record<string, any> = {}

    if (pipelineStatus) {
      const dbFields = pipelineStatusToDbFields(pipelineStatus)
      Object.assign(updateData, dbFields)
    }

    if (notes !== undefined) updateData.notes = notes
    if (approvalStatus !== undefined) updateData.approval_status = approvalStatus

    const updated = await prisma.brandInfluencer.update({
      where: { id: brandInfluencerId },
      data: updateData,
      include: { influencer: true },
    })

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          brand_id: brandId,
          user_id: "system", // Replace with actual user ID when auth is set up
          action: "updated",
          entity_type: "brand_influencer",
          entity_id: brandInfluencerId,
          details: JSON.stringify({ pipelineStatus }),
        },
      })
    } catch (logError) {
      // Don't fail the request if activity logging fails
      console.warn("[Pipeline PATCH] Activity log failed:", logError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        influencer: updated.influencer.full_name || updated.influencer.handle,
        pipelineStatus,
      },
    })
  } catch (error: any) {
    console.error("[Pipeline PATCH] ERROR:", error.message)
    console.error("[Pipeline PATCH] Stack:", error.stack)

    return NextResponse.json(
      { error: `Update failed: ${error.message}` },
      { status: 500 }
    )
  }
}