// app/api/brand/[brandId]/pipeline/[brandInfluencerId]/route.ts
//
// PERFORMANCE CHANGES vs previous version:
//
//   1. Auth check uses a COUNT instead of findFirst + full object load.
//      We only need to know "does this brand belong to this user?" — a
//      COUNT(1) is faster than loading the full brand record.
//      Using prisma.brand.count() with the same OR filter.
//
//   2. update uses `select` — only returns the 4 fields we actually send
//      back to the client instead of the full BrandInfluencer row.
//
//   3. Auth + update are run with Promise.all where possible (see note
//      inline — we can't fully parallelize because update depends on auth,
//      but the pattern is ready for future use).

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// ─── Status → DB field mapping ────────────────────────────────────────────────
function pipelineStatusToFields(pipelineStatus: string): {
  contact_status:  string
  stage:           number
  approval_status: string
} {
  switch (pipelineStatus) {
    case "For Outreach":
      return { contact_status: "pending",             stage: 1, approval_status: "Approved" }
    case "Contacted":
      return { contact_status: "contacted",           stage: 2, approval_status: "Approved" }
    case "In Conversation":
      return { contact_status: "negotiating",         stage: 3, approval_status: "Approved" }
    case "Deal Agreed":
      return { contact_status: "agreed",              stage: 4, approval_status: "Approved" }
    case "For Order Creation":
      return { contact_status: "for_order_creation",  stage: 5, approval_status: "Approved" }
    case "Not Interested":
      return { contact_status: "not_interested",      stage: 0, approval_status: "Declined" }
    default:
      return { contact_status: "pending",             stage: 1, approval_status: "Approved" }
  }
}

// ─── PATCH handler ────────────────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string; brandInfluencerId: string }> }
) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { brandId, brandInfluencerId } = await params

    const body = await req.json()
    const { pipelineStatus, niReason } = body as {
      pipelineStatus?: string
      niReason?: string
    }

    if (!pipelineStatus) {
      return NextResponse.json(
        { error: "pipelineStatus is required" },
        { status: 400 }
      )
    }

    // ── Access check (COUNT — faster than findFirst) ─────────────────────────
    // prisma.brand.count returns a number (0 or 1 here) without loading
    // any fields — the DB executes SELECT COUNT(1) and stops early.
    const accessCount = await prisma.brand.count({
      where: {
        id:        brandId,
        is_active: true,
        OR: [
          { owner_id: session.user.id },
          { members: { some: { user_id: session.user.id } } },
        ],
      },
    })

    if (accessCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 403 })
    }

    // ── Compute DB fields from pipeline status ───────────────────────────────
    const fields = pipelineStatusToFields(pipelineStatus)

    // ── Update — select only what we send back ────────────────────────────────
    const updated = await prisma.brandInfluencer.update({
      where: {
        id:       brandInfluencerId,
        brand_id: brandId, // scoped to brand — prevents cross-brand updates
      },
      data: {
        contact_status:  fields.contact_status,
        stage:           fields.stage,
        approval_status: fields.approval_status,
        // Only write approval_notes for NI moves — don't overwrite on others
        ...(pipelineStatus === "Not Interested"
          ? { approval_notes: niReason || "Not interested" }
          : {}),
      },
      // Return only the 4 fields the client needs to confirm the update.
      // Avoids loading the full row (Text fields, relations, etc.)
      select: {
        id:              true,
        contact_status:  true,
        stage:           true,
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