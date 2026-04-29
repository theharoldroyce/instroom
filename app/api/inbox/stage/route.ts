import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function stageToDbFields(stage: string): Record<string, any> | null {
  switch (stage) {
    case "PROSPECT":           return { contact_status: "not_contacted", stage: 1 }
    case "REACHED_OUT":        return { contact_status: "contacted" }
    case "IN_CONVERSATION":    return { contact_status: "responded" }
    case "ONBOARDED":          return { contact_status: "agreed" }
    case "FOR_ORDER_CREATION": return { order_status: "not_sent" }
    case "IN_TRANSIT":         return { order_status: "in_transit" }
    case "DELIVERED":          return { order_status: "delivered" }
    case "POSTED":             return { content_posted: true }
    case "COMPLETED":          return { stage: 4 }
    case "REJECTED":           return { contact_status: "not_interested" }
    default:                   return null
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions) as any

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const userId = session.user?.id
  if (!userId) {
    return NextResponse.json({ error: "No user in session" }, { status: 403 })
  }

  const { senderEmail, stage, brandId } = await req.json()

  if (!senderEmail || !stage) {
    return NextResponse.json({ error: "Missing senderEmail or stage" }, { status: 400 })
  }

  const dbFields = stageToDbFields(stage)
  if (!dbFields) {
    return NextResponse.json({ error: `Invalid stage: ${stage}` }, { status: 400 })
  }

  let brand_id = brandId
  if (!brand_id) {
    const brandMember = await prisma.brandMember.findFirst({
      where: { user_id: userId },
      select: { brand_id: true },
      orderBy: { created_at: "desc" },
    })
    brand_id = brandMember?.brand_id
  }

  if (!brand_id) {
    return NextResponse.json({ error: "No brand found for user" }, { status: 404 })
  }

  const normalizedEmail = senderEmail.toLowerCase().trim()
  
  let influencer = await prisma.influencer.findFirst({
    where: { email: normalizedEmail },
    select: { id: true },
  })

  if (!influencer) {
    const allInfluencers = await prisma.influencer.findMany({
      select: { id: true, email: true },
    })
    influencer = allInfluencers.find(inf => inf.email?.toLowerCase() === normalizedEmail) || null
  }

  if (!influencer) {
    return NextResponse.json({ error: "Influencer not registered" }, { status: 404 })
  }

  const existingBi = await prisma.brandInfluencer.findFirst({
    where: {
      brand_id: brand_id,
      influencer_id: influencer.id,
    },
    select: { id: true },
  })

  if (!existingBi) {
    return NextResponse.json({ error: "Influencer not found in this brand" }, { status: 404 })
  }

  const updated = await prisma.brandInfluencer.update({
    where: { id: existingBi.id },
    data: dbFields,
    select: {
      id: true,
      contact_status: true,
      stage: true,
      order_status: true,
      content_posted: true,
    },
  })

  return NextResponse.json({ success: true, data: updated })
}