import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (status && status !== "all") {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { billNumber: { contains: search } },
        { customer: { is: { name: { contains: search } } } },
      ]
    }

    // Get bills with customer and user info
    const bills = await prisma.bill.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    // Get total count for pagination
    const total = await prisma.bill.count({ where })

    return NextResponse.json({
      bills,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching bills:", error)
    if (error instanceof Error) {
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json({ error: "Internal server error", details: error instanceof Error ? error.message : error }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { customerId, items, subtotal, tax, discount, total, paymentStatus } = body

    // Generate bill number
    const lastBill = await prisma.bill.findFirst({
      orderBy: { createdAt: "desc" },
      select: { billNumber: true },
    })

    let billNumber = "BILL-001"
    if (lastBill) {
      const lastNumber = parseInt(lastBill.billNumber.split("-")[1])
      billNumber = `BILL-${String(lastNumber + 1).padStart(3, "0")}`
    }

    // Create bill with items
    const bill = await prisma.bill.create({
      data: {
        billNumber,
        customerId,
        userId: session.user.id,
        subtotal,
        tax,
        discount,
        total,
        status: paymentStatus || "PENDING",
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(bill, { status: 201 })
  } catch (error) {
    console.error("Error creating bill:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 