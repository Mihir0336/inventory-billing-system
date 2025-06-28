import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { companyName: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ companyName: user.companyName || "My Company" })
  } catch (error) {
    console.error("Error fetching company name:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { companyName } = await request.json()

    if (!companyName || typeof companyName !== 'string') {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { companyName: companyName.trim() },
      select: { companyName: true }
    })

    return NextResponse.json({ companyName: updatedUser.companyName })
  } catch (error) {
    console.error("Error updating company name:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 