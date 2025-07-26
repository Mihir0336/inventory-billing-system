import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { sendMail } from "@/lib/mailer"

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 })
  }

  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    // Respond with success to prevent email enumeration
    return NextResponse.json({ message: "If an account with that email exists, a reset link has been sent." })
  }

  // Generate a token
  const token = crypto.randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

  // Store token in DB (assume a PasswordResetToken model)
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expires,
    },
  })

  // TODO: Send email. For now, log the reset link
  const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`
  await sendMail({
    to: email,
    subject: "Password Reset Request",
    html: `<p>You requested a password reset. Click the link below to set a new password:</p>
           <p><a href='${resetUrl}'>Reset Password</a></p>
           <p>If you did not request this, you can ignore this email.</p>`
  })

  return NextResponse.json({ message: "If an account with that email exists, a reset link has been sent." })
} 