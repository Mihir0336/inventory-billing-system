import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()
  if (!token || !password) {
    return NextResponse.json({ message: "Token and password are required." }, { status: 400 })
  }

  // Find the reset token
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })
  if (!resetToken || resetToken.expires < new Date()) {
    return NextResponse.json({ message: "Invalid or expired token." }, { status: 400 })
  }

  // Update the user's password
  const hashedPassword = await bcrypt.hash(password, 10)
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashedPassword },
  })

  // Delete the token
  await prisma.passwordResetToken.delete({ where: { token } })

  return NextResponse.json({ message: "Password reset successful." })
} 