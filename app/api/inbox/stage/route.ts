import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Maps frontend PipelineStage → the DB fields to update on BrandInfluencer
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

  // Expects: { senderEmail: string, stage: string }
  const { senderEmail, stage } = await req.json()

  if (!senderEmail || !stage) {
    return NextResponse.json({ error: "Missing senderEmail or stage" }, { status: 400 })
  }

  const dbFields = stageToDbFields(stage)
  if (!dbFields) {
    return NextResponse.json({ error: `Invalid stage: ${stage}` }, { status: 400 })
  }

  // Get the user's active brand
  const brandMember = await prisma.brandMember.findFirst({
    where: { user_id: userId },
    select: { brand_id: true },
    orderBy: { created_at: "desc" },
  })

  if (!brandMember) {
    return NextResponse.json({ error: "No brand found for user" }, { status: 404 })
  }

  // Update the matching BrandInfluencer record
  const updated = await prisma.brandInfluencer.updateMany({
    where: {
      brand_id: brandMember.brand_id,
      influencer: { email: senderEmail },
    },
    data: dbFields,
  })

  if (updated.count === 0) {
    return NextResponse.json({ error: "No matching influencer found for that email" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}