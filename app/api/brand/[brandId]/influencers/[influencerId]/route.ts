import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

/**
 * PUT /api/brand/[brandId]/influencers/[influencerId]
 * Update both Influencer and BrandInfluencer records
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string; influencerId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { brandId, influencerId } = await params

    // Verify user owns this brand
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    })

    if (!brand || brand.owner_id !== session.user.id) {
      return NextResponse.json({ error: "Brand not found or access denied" }, { status: 404 })
    }

    const data = await req.json()

    // Separate fields by table
    const influencerUpdateData: any = {}
    if (data.handle !== undefined) influencerUpdateData.handle = data.handle
    if (data.platform !== undefined) influencerUpdateData.platform = data.platform
    if (data.full_name !== undefined) influencerUpdateData.full_name = data.full_name
    if (data.email !== undefined) influencerUpdateData.email = data.email
    if (data.gender !== undefined) influencerUpdateData.gender = data.gender
    if (data.niche !== undefined) influencerUpdateData.niche = data.niche
    if (data.location !== undefined) influencerUpdateData.location = data.location
    if (data.bio !== undefined) influencerUpdateData.bio = data.bio
    if (data.profile_image_url !== undefined) influencerUpdateData.profile_image_url = data.profile_image_url
    if (data.social_link !== undefined) influencerUpdateData.social_link = data.social_link
    if (data.follower_count !== undefined) influencerUpdateData.follower_count = Number(data.follower_count)
    if (data.engagement_rate !== undefined) influencerUpdateData.engagement_rate = Number(data.engagement_rate)
    if (data.avg_likes !== undefined) influencerUpdateData.avg_likes = Number(data.avg_likes)
    if (data.avg_comments !== undefined) influencerUpdateData.avg_comments = Number(data.avg_comments)
    if (data.avg_views !== undefined) influencerUpdateData.avg_views = Number(data.avg_views)

    const brandInfluencerUpdateData: any = {}
    if (data.contact_status !== undefined) brandInfluencerUpdateData.contact_status = data.contact_status
    if (data.outreach_method !== undefined) brandInfluencerUpdateData.outreach_method = data.outreach_method
    if (data.stage !== undefined) brandInfluencerUpdateData.stage = Number(data.stage)
    if (data.order_status !== undefined) brandInfluencerUpdateData.order_status = data.order_status
    if (data.product_details !== undefined) brandInfluencerUpdateData.product_details = data.product_details
    if (data.content_posted !== undefined) brandInfluencerUpdateData.content_posted = data.content_posted === true || data.content_posted === "true"
    if (data.post_url !== undefined) brandInfluencerUpdateData.post_url = data.post_url
    if (data.post_caption !== undefined) brandInfluencerUpdateData.post_caption = data.post_caption
    if (data.likes_count !== undefined) brandInfluencerUpdateData.likes_count = Number(data.likes_count)
    if (data.comments_count !== undefined) brandInfluencerUpdateData.comments_count = Number(data.comments_count)
    if (data.engagement_count !== undefined) brandInfluencerUpdateData.engagement_count = Number(data.engagement_count)
    if (data.agreed_rate !== undefined) brandInfluencerUpdateData.agreed_rate = data.agreed_rate ? Number(data.agreed_rate) : null
    if (data.currency !== undefined) brandInfluencerUpdateData.currency = data.currency
    if (data.deliverables !== undefined) brandInfluencerUpdateData.deliverables = data.deliverables
    if (data.notes !== undefined) brandInfluencerUpdateData.notes = data.notes
    if (data.internal_rating !== undefined) brandInfluencerUpdateData.internal_rating = data.internal_rating ? Number(data.internal_rating) : null
    if (data.approval_status !== undefined) brandInfluencerUpdateData.approval_status = data.approval_status
    if (data.approval_notes !== undefined) brandInfluencerUpdateData.approval_notes = data.approval_notes
    if (data.transferred_date !== undefined) brandInfluencerUpdateData.transferred_date = data.transferred_date ? new Date(data.transferred_date) : null

    // Update both tables if needed
    if (Object.keys(influencerUpdateData).length > 0) {
      await prisma.influencer.update({
        where: { id: influencerId },
        data: influencerUpdateData,
      })
    }

    if (Object.keys(brandInfluencerUpdateData).length > 0) {
      await prisma.brandInfluencer.update({
        where: {
          brand_id_influencer_id: {
            brand_id: brandId,
            influencer_id: influencerId,
          },
        },
        data: brandInfluencerUpdateData,
      })
    }

    // Return updated records
    const updatedInfluencer = await prisma.influencer.findUnique({
      where: { id: influencerId },
    })

    const updatedBrandInfluencer = await prisma.brandInfluencer.findUnique({
      where: {
        brand_id_influencer_id: {
          brand_id: brandId,
          influencer_id: influencerId,
        },
      },
    })

    return NextResponse.json({
      influencer: updatedInfluencer,
      brandInfluencer: updatedBrandInfluencer,
    })
  } catch (error) {
    console.error("Error updating brand influencer:", error)
    return NextResponse.json(
      { error: "Failed to update influencer", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
