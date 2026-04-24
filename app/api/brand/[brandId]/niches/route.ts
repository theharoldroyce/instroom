// app/api/brand/[brandId]/niches/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"


type Params = { params: Promise<{ brandId: string }> }

// ── GET /api/brand/[brandId]/niches ──────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { brandId } = await params

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

  const niches = await prisma.brandNiche.findMany({
    where: { brand_id: brandId },
    orderBy: { name: "asc" },
  })

  return NextResponse.json({ niches })
}

// ── POST /api/brand/[brandId]/niches ─────────────────────────────────────────
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { brandId } = await params
  const body = await req.json()
  const name = body.name?.trim()

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  // Verify access
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
    const niche = await prisma.brandNiche.create({
      data: {
          brand_id: brandId,
        name,
      },
    })
    return NextResponse.json({ niche }, { status: 201 })
  } catch (err: any) {
    // Unique constraint — niche already exists for this brand
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "This niche already exists for this brand" },
        { status: 409 }
      )
    }
    console.error("[niches POST]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}