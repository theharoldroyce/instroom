import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { brandId } = await params

    // Verify user owns or is member of the brand
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    })

    if (!brand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      )
    }

    // Check if user is owner or member (not just owner)
    const isMember = await prisma.brandMember.findUnique({
      where: { brand_id_user_id: { brand_id: brandId, user_id: session.user.id } },
    })

    if (brand.owner_id !== session.user.id && !isMember) {
      return NextResponse.json(
        { error: "Brand not found or unauthorized" },
        { status: 403 }
      )
    }

    // Owners can always manage collaborators
    // Members can only access if brand is active (subscription status)
    const isOwner = brand.owner_id === session.user.id
    if (!isOwner && !brand.is_active) {
      return NextResponse.json(
        { error: "This workspace is unavailable." },
        { status: 403 }
      )
    }

    // Get owner
    const owner = await prisma.user.findUnique({
      where: { id: brand.owner_id },
      select: { id: true, email: true, name: true, image: true },
    })

    // Get collaborators
    const members = await prisma.brandMember.findMany({
      where: { brand_id: brandId },
      include: {
        user: {
          select: { id: true, email: true, name: true, image: true },
        },
      },
      orderBy: { joined_at: "desc" },
    })

    return NextResponse.json({
      owner,
      members: members.map((m) => ({
        id: m.user.id,
        email: m.user.email,
        name: m.user.name,
        image: m.user.image,
        role: m.role,
        joinedAt: m.joined_at,
      })),
    })
  } catch (error) {
    console.error("Error fetching collaborators:", error)
    return NextResponse.json(
      { error: "Failed to fetch collaborators", details: String(error) },
      { status: 500 }
    )
  }
}
