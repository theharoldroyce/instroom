import { prisma } from "./prisma"

/**
 * Check if user can add a new brand based on their subscription plan
 */
export async function canAddBrand(userId: string): Promise<{
  allowed: boolean
  current: number
  max: number | null
  message?: string
}> {
  try {
    const subscription = await prisma.userSubscription.findUnique({
      where: { user_id: userId },
      include: {
        plan: true,
      },
    })

    if (!subscription || subscription.status !== "active") {
      return {
        allowed: false,
        current: 0,
        max: 0,
        message: "No active subscription found",
      }
    }

    // Count existing brands
    const brandCount = await prisma.brand.count({
      where: { owner_id: userId },
    })

    // Unlimited if max_brands is null (Agency plan)
    if (subscription.plan.max_brands === null) {
      return {
        allowed: true,
        current: brandCount,
        max: null,
      }
    }

    // Calculate max brands for limited plans
    const includedBrands = subscription.plan.included_brands
    const maxBrands = subscription.plan.max_brands + subscription.extra_brands

    return {
      allowed: brandCount < maxBrands,
      current: brandCount,
      max: maxBrands,
      message:
        brandCount >= maxBrands
          ? subscription.plan.name === "solo"
            ? "Solo plan only includes 1 brand. Upgrade to Team or Agency plan to add more."
            : `You've reached your brand limit (${maxBrands}). Upgrade your plan or purchase extra brands.`
          : undefined,
    }
  } catch (error) {
    return {
      allowed: false,
      current: 0,
      max: 0,
      message: "Error checking brand limits",
    }
  }
}

/**
 * Check if user can add a new collaborator to a brand
 */
export async function canAddCollaborator(
  userId: string,
  brandId: string
): Promise<{
  allowed: boolean
  current: number
  max: number | null
  message?: string
}> {
  try {
    // Verify user owns the brand
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    })

    if (!brand || brand.owner_id !== userId) {
      return {
        allowed: false,
        current: 0,
        max: 0,
        message: "Brand not found or you don't have permission",
      }
    }

    const subscription = await prisma.userSubscription.findUnique({
      where: { user_id: userId },
      include: { plan: true },
    })

    if (!subscription || subscription.status !== "active") {
      return {
        allowed: false,
        current: 0,
        max: 0,
        message: "No active subscription found",
      }
    }

    // Count existing members (exclude owner)
    const memberCount = await prisma.brandMember.count({
      where: { brand_id: brandId },
    })

    // Unlimited if max_seats is null (Agency plan)
    if (subscription.plan.max_seats === null) {
      return {
        allowed: true,
        current: memberCount,
        max: null,
      }
    }

    // Calculate max seats
    // For Solo: included=0, max=5 → maxSeats = 0 + extra (up to max)
    // For Team: included=10, max=25 → maxSeats = 10 + extra (up to max)
    const maxSeats = subscription.plan.included_seats + subscription.extra_seats

    return {
      allowed: memberCount < maxSeats,
      current: memberCount,
      max: maxSeats,
      message:
        memberCount >= maxSeats
          ? `You've reached your collaborator limit (${maxSeats}). Upgrade your plan or purchase extra seats.`
          : undefined,
    }
  } catch (error) {
    return {
      allowed: false,
      current: 0,
      max: 0,
      message: "Error checking collaborator limits",
    }
  }
}

/**
 * Check if user can add a new influencer to their brand
 */
export async function canAddInfluencer(
  userId: string,
  brandId: string
): Promise<{
  allowed: boolean
  current: number
  max: number | null
  message?: string
}> {
  try {
    // Verify user owns the brand
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    })

    if (!brand || brand.owner_id !== userId) {
      return {
        allowed: false,
        current: 0,
        max: 0,
        message: "Brand not found or you don't have permission",
      }
    }

    const subscription = await prisma.userSubscription.findUnique({
      where: { user_id: userId },
      include: { plan: true },
    })

    if (!subscription || subscription.status !== "active") {
      return {
        allowed: false,
        current: 0,
        max: 0,
        message: "No active subscription found",
      }
    }

    const maxInfluencers = subscription.plan.max_influencers

    // Unlimited if null
    if (maxInfluencers === null) {
      return {
        allowed: true,
        current: 0,
        max: null,
      }
    }

    // Count existing influencers for this brand
    const influencerCount = await prisma.brandInfluencer.count({
      where: { brand_id: brandId },
    })

    return {
      allowed: influencerCount < maxInfluencers,
      current: influencerCount,
      max: maxInfluencers,
      message:
        influencerCount >= maxInfluencers
          ? `You've reached your influencer limit (${maxInfluencers}). Upgrade your plan to add more.`
          : undefined,
    }
  } catch (error) {
    return {
      allowed: false,
      current: 0,
      max: 0,
      message: "Error checking influencer limits",
    }
  }
}

/**
 * Check if user can create a new active campaign
 */
export async function canCreateCampaign(
  userId: string,
  brandId: string
): Promise<{
  allowed: boolean
  current: number
  max: number | null
  message?: string
}> {
  try {
    // Verify user owns the brand
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    })

    if (!brand || brand.owner_id !== userId) {
      return {
        allowed: false,
        current: 0,
        max: 0,
        message: "Brand not found or you don't have permission",
      }
    }

    const subscription = await prisma.userSubscription.findUnique({
      where: { user_id: userId },
      include: { plan: true },
    })

    if (!subscription || subscription.status !== "active") {
      return {
        allowed: false,
        current: 0,
        max: 0,
        message: "No active subscription found",
      }
    }

    const maxCampaigns = subscription.plan.max_campaigns

    // Unlimited if null
    if (maxCampaigns === null) {
      return {
        allowed: true,
        current: 0,
        max: null,
      }
    }

    // Count TOTAL active campaigns across ALL brands for this user
    const activeCampaignCount = await prisma.campaign.count({
      where: {
        brand: {
          owner_id: userId,
        },
        status: "active"
      },
    })

    return {
      allowed: activeCampaignCount < maxCampaigns,
      current: activeCampaignCount,
      max: maxCampaigns,
      message:
        activeCampaignCount >= maxCampaigns
          ? `You've reached your active campaign limit (${maxCampaigns}). Complete or archive existing campaigns to create new ones.`
          : undefined,
    }
  } catch (error) {
    return {
      allowed: false,
      current: 0,
      max: 0,
      message: "Error checking campaign limits",
    }
  }
}

/**
 * Check if user has API access based on their subscription plan
 */
export async function hasAPIAccess(userId: string): Promise<{
  allowed: boolean
  message?: string
}> {
  try {
    const subscription = await prisma.userSubscription.findUnique({
      where: { user_id: userId },
      include: { plan: true },
    })

    if (!subscription || subscription.status !== "active") {
      return {
        allowed: false,
        message: "No active subscription found",
      }
    }

    return {
      allowed: subscription.plan.can_use_api === true,
      message: subscription.plan.can_use_api 
        ? undefined 
        : "API access is not included in your plan. Upgrade to Team or Agency plan to use the API.",
    }
  } catch (error) {
    return {
      allowed: false,
      message: "Error checking API access",
    }
  }
}

/**
 * Check if user has custom branding access
 */
export async function hasCustomBranding(userId: string): Promise<{
  allowed: boolean
  message?: string
}> {
  try {
    const subscription = await prisma.userSubscription.findUnique({
      where: { user_id: userId },
      include: { plan: true },
    })

    if (!subscription || subscription.status !== "active") {
      return {
        allowed: false,
        message: "No active subscription found",
      }
    }

    return {
      allowed: subscription.plan.custom_branding === true,
      message: subscription.plan.custom_branding 
        ? undefined 
        : "Custom branding is not included in your plan. Upgrade to Agency plan to use custom branding.",
    }
  } catch (error) {
    return {
      allowed: false,
      message: "Error checking custom branding access",
    }
  }
}

/**
 * Get subscription plan details for a user
 */
export async function getSubscriptionDetails(userId: string) {
  return await prisma.userSubscription.findUnique({
    where: { user_id: userId },
    include: {
      plan: true,
    },
  })
}
