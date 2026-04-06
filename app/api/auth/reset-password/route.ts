import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      )
    }

    // Hash the provided token to compare with stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex")

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: hashedToken },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (new Date() > verificationToken.expires) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token: hashedToken },
      })

      return NextResponse.json(
        { error: "Reset link expired. Please request a new one." },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: hashedPassword },
    })

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { token: hashedToken },
    })

    // Invalidate all sessions for this user
    await prisma.session.deleteMany({
      where: { userId: user.id },
    })

    return NextResponse.json(
      { message: "Password reset successfully. Please log in with your new password." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    )
  }
}
