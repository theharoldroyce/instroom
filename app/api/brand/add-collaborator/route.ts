import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { canAddCollaborator } from "@/lib/subscription-limits"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { brandId, email, role = "collaborator" } = await req.json()

    if (!brandId || !email) {
      return NextResponse.json(
        { error: "Brand ID and email are required" },
        { status: 400 }
      )
    }

    // Check if user can add collaborators
    const canAdd = await canAddCollaborator(session.user.id, brandId)
    if (!canAdd.allowed) {
      return NextResponse.json(
        {
          error: canAdd.message || "Cannot add collaborator",
          current: canAdd.current,
          max: canAdd.max,
        },
        { status: 403 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // Check if already a member
      const existingMember = await prisma.brandMember.findUnique({
        where: {
          brand_id_user_id: {
            brand_id: brandId,
            user_id: existingUser.id,
          },
        },
      })

      if (existingMember) {
        return NextResponse.json(
          { error: "User is already a member of this brand" },
          { status: 400 }
        )
      }

      // Add as direct member if user exists
      const member = await prisma.brandMember.create({
        data: {
          brand_id: brandId,
          user_id: existingUser.id,
          role: role as "owner" | "collaborator" | "viewer",
        },
      })

      // Log activity
      await prisma.activityLog.create({
        data: {
          brand_id: brandId,
          user_id: session.user.id,
          action: "created",
          entity_type: "brand_member",
          entity_id: member.id,
          details: `Added ${existingUser.email} as ${role}`,
        },
      })

      return NextResponse.json({
        success: true,
        type: "direct_member",
        member,
        remaining: canAdd.max - canAdd.current - 1,
      })
    } else {
      // Create invitation for non-existing user
      const token = crypto.randomBytes(32).toString("hex")
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      const invitation = await prisma.brandInvitation.create({
        data: {
          brand_id: brandId,
          email,
          invited_by_id: session.user.id,
          role: role as "owner" | "collaborator" | "viewer",
          token,
          expires_at: expiresAt,
        },
      })

      // Log activity
      await prisma.activityLog.create({
        data: {
          brand_id: brandId,
          user_id: session.user.id,
          action: "created",
          entity_type: "brand_invitation",
          entity_id: invitation.id,
          details: `Sent invitation to ${email}`,
        },
      })

      // TODO: Send invitation email here

      return NextResponse.json({
        success: true,
        type: "invitation_sent",
        invitation,
        remaining: canAdd.max - canAdd.current - 1,
      })
    }
  } catch (error) {
    console.error("Error adding collaborator:", error)
    return NextResponse.json(
      { error: "Failed to add collaborator" },
      { status: 500 }
    )
  }
}
