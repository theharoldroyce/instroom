// app/api/brand/[brandId]/niches/[nicheId]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ brandId: string; nicheId: string }> }

// ── DELETE /api/brand/[brandId]/niches/[nicheId] ──────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { brandId, nicheId } = await params

  // Verify the user has access to this brand
  const brand = await prisma.brand.findFirst({
    where: {
      id: brandId,
      OR: [
        { owner_id: session.user.id },
        { members: { some: { user_id: session.user.id } } },
      ],
    },
  })

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 })
  }

  try {
    await prisma.brandNiche.delete({
      where: { id: nicheId },
    })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Niche not found" }, { status: 404 })
    }
    console.error("[niches DELETE]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}