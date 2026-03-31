import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { user_id, name } = await req.json();
    if (!user_id || !name) {
      return NextResponse.json({ error: "Missing user_id or name" }, { status: 400 });
    }
    const user = await prisma.user.update({
      where: { id: user_id },
      data: { name },
    });
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}
