import { prisma } from "./prisma"

/**
 * Check if user can add a new brand based on their subscription plan
 */
export async function canAddBrand(userId: string): Promise<{
  allowed: boolean
  current: number
  max: number
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

    // Check plan name - Solo can't add brands
    if (subscription.plan.name === "solo") {
      return {
        allowed: false,
        current: 0,
        max: subscription.plan.included_brands,
        message: "Solo plan only includes 1 brand. Upgrade to Team or Agency plan to add more.",
      }
    }

    // Count existing brands
    const brandCount = await prisma.brand.count({
      where: { owner_id: userId },
    })

    // Calculate max brands
    const maxBrands =
      (subscription.plan.max_brands || subscription.plan.included_brands) +
      subscription.extra_brands

    return {
      allowed: brandCount < maxBrands,
      current: brandCount,
      max: maxBrands,
      message:
        brandCount >= maxBrands
          ? `You've reached your brand limit (${maxBrands}). Upgrade your plan or purchase extra brands.`
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
  max: number
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

    // Check plan name - Solo can't add collaborators
    if (subscription.plan.name === "solo") {
      return {
        allowed: false,
        current: 0,
        max: subscription.plan.included_seats,
        message:
          "Solo plan doesn't include team collaboration. Upgrade to Team or Agency plan to add collaborators.",
      }
    }

    // Count existing members (exclude owner)
    const memberCount = await prisma.brandMember.count({
      where: { brand_id: brandId },
    })

    // Calculate max seats
    const maxSeats =
      (subscription.plan.max_seats || subscription.plan.included_seats) +
      subscription.extra_seats

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
