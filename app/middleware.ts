import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function middleware(req: any) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/onboarding") || pathname.startsWith("/dashboard")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    const subscription = await prisma.userSubscription.findFirst({
      where: {
        user_id: token.sub,
        status: { in: ["active", "trialing"] },
      },
    });

    if (!subscription) {
      return NextResponse.redirect(new URL("/pricing", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/onboarding/:path*", "/dashboard/:path*"],
};