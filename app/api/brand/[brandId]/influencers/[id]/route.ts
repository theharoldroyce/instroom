import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

const VALID_CONTACT_STATUSES = new Set(["not_contacted","contacted","interested","agreed","not_interested","responded","replied","email_error","no_response","paid_collab","negotiating"])
const VALID_APPROVAL_STATUSES = new Set(["Pending","Approved","Declined"])

export async function PUT(req: NextRequest, { params }: { params: Promise<{ brandId: string; id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { brandId, id } = await params
    const brand = await prisma.brand.findUnique({ where: { id: brandId } })
    if (!brand || brand.owner_id !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const data = await req.json()
    const inf: any = {}
    if (data.full_name !== undefined) inf.full_name = data.full_name || null
    if (data.email !== undefined) inf.email = (data.email && data.email.includes("@")) ? data.email : null
    if (data.gender !== undefined) inf.gender = data.gender || null
    if (data.niche !== undefined) inf.niche = data.niche || null
    if (data.location !== undefined) inf.location = data.location || null
    if (data.bio !== undefined) inf.bio = data.bio || null
    if (data.profile_image_url !== undefined) inf.profile_image_url = (data.profile_image_url && !data.profile_image_url.includes("x-expires=")) ? data.profile_image_url : null
    if (data.social_link !== undefined) inf.social_link = data.social_link || null
    if (data.follower_count !== undefined) inf.follower_count = parseInt(String(data.follower_count)) || 0
    if (data.engagement_rate !== undefined) inf.engagement_rate = parseFloat(String(data.engagement_rate)) || 0
    if (data.avg_likes !== undefined) inf.avg_likes = parseInt(String(data.avg_likes)) || 0
    if (data.avg_comments !== undefined) inf.avg_comments = parseInt(String(data.avg_comments)) || 0
    if (data.avg_views !== undefined) inf.avg_views = parseInt(String(data.avg_views)) || 0
    const bi: any = {}
    if (data.contact_status !== undefined) bi.contact_status = VALID_CONTACT_STATUSES.has(data.contact_status) ? data.contact_status : "not_contacted"
    if (data.stage !== undefined) bi.stage = Math.max(1, Math.min(5, parseInt(String(data.stage)) || 1))
    if (data.agreed_rate !== undefined) bi.agreed_rate = data.agreed_rate ? parseFloat(String(data.agreed_rate)) : null
    if (data.notes !== undefined) bi.notes = data.notes || null
    if (data.approval_status !== undefined) bi.approval_status = VALID_APPROVAL_STATUSES.has(data.approval_status) ? data.approval_status : null
    if (data.approval_notes !== undefined) bi.approval_notes = data.approval_notes || null
    if (data.transferred_date !== undefined) bi.transferred_date = data.transferred_date ? new Date(data.transferred_date) : null
    if (Object.keys(inf).length > 0) await prisma.influencer.update({ where: { id }, data: inf })
    if (Object.keys(bi).length > 0) await prisma.brandInfluencer.update({ where: { brand_id_influencer_id: { brand_id: brandId, influencer_id: id } }, data: bi })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("PUT /influencers/[id]:", err?.code, err?.message)
    return NextResponse.json({ error: err?.message ?? "error", code: err?.code }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ brandId: string; id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { brandId, id } = await params
    const brand = await prisma.brand.findUnique({ where: { id: brandId } })
    if (!brand || brand.owner_id !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 })
    await prisma.brandInfluencer.delete({ where: { brand_id_influencer_id: { brand_id: brandId, influencer_id: id } } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ error: err?.message }, { status: 500 })
  }
}
