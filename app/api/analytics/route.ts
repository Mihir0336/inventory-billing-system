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
    const period = searchParams.get("period") || "6" // months

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - parseInt(period))

    // Get total revenue
    const totalRevenue = await prisma.bill.aggregate({
      where: {
        status: "PAID",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        total: true,
      },
    })

    // Get total sales count
    const totalSales = await prisma.bill.count({
      where: {
        status: "PAID",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Get active customers count
    const activeCustomers = await prisma.customer.count({
      where: {
        bills: {
          some: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    })

    // Get average order value
    const avgOrderValue = totalSales > 0 ? (totalRevenue._sum.total || 0) / totalSales : 0

    // Get monthly revenue data using Prisma instead of raw SQL
    const monthlyBills = await prisma.bill.findMany({
      where: {
        status: "PAID",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
    })

    // Group by month manually
    const monthlyRevenue = monthlyBills.reduce((acc: any, bill: any) => {
      const month = bill.createdAt.toISOString().slice(0, 7) // YYYY-MM format
      if (!acc[month]) {
        acc[month] = { month, revenue: 0, sales: 0 }
      }
      acc[month].revenue += bill.total
      acc[month].sales += 1
      return acc
    }, {})

    const monthlyRevenueArray = Object.values(monthlyRevenue)

    // Get product category data
    const productCategories = await prisma.billItem.groupBy({
      by: ['productId'],
      where: {
        bill: {
          status: "PAID",
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
    })

    // Get product details for categories
    const productCategoriesWithDetails = await Promise.all(
      productCategories.map(async (item: any) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, category: true },
        })
        return {
          ...item,
          product,
        }
      })
    )

    // Get recent transactions
    const recentTransactions = await prisma.bill.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    })

    // Get top products
    const topProducts = await prisma.billItem.groupBy({
      by: ['productId'],
      where: {
        bill: {
          status: "PAID",
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      _sum: {
        total: true,
      },
      orderBy: {
        _sum: {
          total: "desc",
        },
      },
      take: 5,
    })

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item: any) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, category: true },
        })
        return {
          ...item,
          product,
        }
      })
    )

    return NextResponse.json({
      metrics: {
        totalRevenue: totalRevenue._sum.total || 0,
        totalSales,
        activeCustomers,
        avgOrderValue,
      },
      charts: {
        monthlyRevenue: monthlyRevenueArray.length > 0 ? monthlyRevenueArray : [
          { month: "2024-01", revenue: 0, sales: 0 },
          { month: "2024-02", revenue: 0, sales: 0 },
          { month: "2024-03", revenue: 0, sales: 0 },
        ],
        productCategories: productCategoriesWithDetails.length > 0 ? productCategoriesWithDetails : [],
        topProducts: topProductsWithDetails.length > 0 ? topProductsWithDetails : [],
      },
      recentTransactions: recentTransactions.length > 0 ? recentTransactions : [],
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 