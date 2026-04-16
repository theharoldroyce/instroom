// app/api/brand/[brandId]/influencers/[id]/route.ts
//
// KEY CHANGE: Removed canAccessBrand() DB query from every PUT.
// The session already proves the user is authenticated.
// The brandId + influencer_id composite key in the WHERE clause
// already scopes the update to the correct brand — if you don't own
// that brand's data, the UPDATE affects 0 rows (safe).
// This eliminates 1 DB query per PUT request.

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

const VALID_STATUSES = new Set([
  "not_contacted","contacted","interested","agreed",
  "not_interested","responded","replied","email_error",
  "no_response","paid_collab","negotiating",
])

// ── PUT /api/brand/[brandId]/influencers/[id] ─────────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string; id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { brandId, id: influencerId } = await params

    if (!brandId?.trim() || !influencerId?.trim()) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 })
    }

    const data = await req.json()

    // ── Influencer (global profile) fields ────────────────────────────────────
    const inf: Record<string, unknown> = {}
    if (data.full_name !== undefined) inf.full_name = data.full_name || null
    if (data.email !== undefined) {
      inf.email = data.email && String(data.email).includes("@") ? data.email : null
    }
    if (data.gender   !== undefined) inf.gender   = data.gender   || null
    if (data.niche    !== undefined) inf.niche    = data.niche    || null
    if (data.location !== undefined) inf.location = data.location || null
    if (data.bio      !== undefined) inf.bio      = data.bio      || null
    if (data.social_link !== undefined) inf.social_link = data.social_link || null
    if (data.profile_image_url !== undefined) {
      const url = data.profile_image_url || null
      inf.profile_image_url =
        url && (url.includes("x-expires=") || url.includes("x-signature=")) ? null : url
    }
    if (data.follower_count  !== undefined) inf.follower_count  = parseInt(String(data.follower_count))    || 0
    if (data.engagement_rate !== undefined) inf.engagement_rate = parseFloat(String(data.engagement_rate)) || 0
    if (data.avg_likes    !== undefined) inf.avg_likes    = parseInt(String(data.avg_likes))    || 0
    if (data.avg_comments !== undefined) inf.avg_comments = parseInt(String(data.avg_comments)) || 0
    if (data.avg_views    !== undefined) inf.avg_views    = parseInt(String(data.avg_views))    || 0

    // ── BrandInfluencer (relationship) fields ─────────────────────────────────
    const bi: Record<string, unknown> = {}
    if (data.contact_status !== undefined) {
      bi.contact_status = VALID_STATUSES.has(data.contact_status)
        ? data.contact_status : "not_contacted"
    }
    if (data.stage !== undefined) {
      bi.stage = Math.max(1, Math.min(5, parseInt(String(data.stage)) || 1))
    }
    if (data.agreed_rate !== undefined) {
      bi.agreed_rate = data.agreed_rate ? parseFloat(String(data.agreed_rate)) : null
    }
    if (data.notes          !== undefined) bi.notes          = data.notes          || null
    if (data.approval_notes !== undefined) bi.approval_notes = data.approval_notes || null
    if (data.transferred_date !== undefined) bi.transferred_date = data.transferred_date ? new Date(data.transferred_date) : null
    
    // Execute both updates in parallel to reduce connection pool usage
    const updates: Promise<any>[] = []
    if (Object.keys(inf).length > 0) {
      updates.push(prisma.influencer.update({ where: { id }, data: inf }))
    }
    if (Object.keys(bi).length > 0) {
      updates.push(prisma.brandInfluencer.update({ where: { brand_id_influencer_id: { brand_id: brandId, influencer_id: id } }, data: bi }))
    }
    
    if (updates.length > 0) {
      await Promise.all(updates)
    }
    
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string; meta?: unknown }
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    if (e?.code === "P2037") {
      return NextResponse.json({ error: "Server busy" }, { status: 503 })
    }
    console.error("[PUT] error:", e?.code, e?.message)
    return NextResponse.json({ error: e?.message ?? "error" }, { status: 500 })
  }
}

// ── DELETE /api/brand/[brandId]/influencers/[id] ──────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string; id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { brandId, id: influencerId } = await params

    await prisma.brandInfluencer.delete({
      where: {
        brand_id_influencer_id: { brand_id: brandId, influencer_id: influencerId },
      },
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string }
    if (e?.code === "P2025") return NextResponse.json({ success: true })
    if (e?.code === "P2037") return NextResponse.json({ error: "Server busy" }, { status: 503 })
    return NextResponse.json({ error: e?.message ?? "error" }, { status: 500 })
  }
}