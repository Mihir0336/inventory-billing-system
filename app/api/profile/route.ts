import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import bcrypt from "bcryptjs"
import formidable from "formidable"
import fs from "fs"
import path from "path"

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the request is multipart/form-data
    const contentType = request.headers.get("content-type") || ""
    if (contentType.includes("multipart/form-data")) {
      // Parse form data
      const form = formidable({
        multiples: false,
        uploadDir: path.join(process.cwd(), "public", "uploads"),
        keepExtensions: true,
        filename: (name, ext, part) => {
          // Use user id and timestamp for unique filename
          return `${session.user.id}_${Date.now()}${ext}`
        },
      })

      // formidable expects a Node.js IncomingMessage, so we need to convert the request
      const req = (request as any).req || request
      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err)
          else resolve([fields, files])
        })
      })

      let imageUrl = undefined
      if (files && files.photo && files.photo[0]) {
        const file = files.photo[0]
        imageUrl = `/uploads/${path.basename(file.filepath)}`
      }

      const { name, email } = fields

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email,
            id: { not: session.user.id },
          },
        })
        if (existingUser) {
          return NextResponse.json({ error: "Email already in use" }, { status: 400 })
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name,
          email,
          image: imageUrl,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      return NextResponse.json(updatedUser)
    } else {
      // Fallback to JSON body for non-file updates
      const body = await request.json()
      const { name, email, phone, address } = body

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email,
            id: { not: session.user.id },
          },
        })
        if (existingUser) {
          return NextResponse.json({ error: "Email already in use" }, { status: 400 })
        }
      }
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name,
          email,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      return NextResponse.json(updatedUser)
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 