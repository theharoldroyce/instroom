import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Get brands owned by user OR where user is a member
  const brands = await prisma.brand.findMany({
    where: {
      OR: [
        { owner_id: session.user.id },  // User is owner
        { members: { some: { user_id: session.user.id } } },  // User is member
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logo_url: true,
      owner_id: true,
    },
    orderBy: { created_at: "desc" },
  })

  return Response.json({
    brands: brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logo_url: brand.logo_url,
      isOwner: brand.owner_id === session.user.id,
    })),
  })
}
