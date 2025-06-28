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

    // Calculate date ranges
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get total revenue (all time)
    const totalRevenue = await prisma.bill.aggregate({
      where: {
        status: "PAID",
      },
      _sum: {
        total: true,
      },
    })

    // Get this month's revenue
    const thisMonthRevenue = await prisma.bill.aggregate({
      where: {
        status: "PAID",
        createdAt: {
          gte: thisMonth,
        },
      },
      _sum: {
        total: true,
      },
    })

    // Get last month's revenue
    const lastMonthRevenue = await prisma.bill.aggregate({
      where: {
        status: "PAID",
        createdAt: {
          gte: lastMonth,
          lte: lastMonthEnd,
        },
      },
      _sum: {
        total: true,
      },
    })

    // Calculate revenue growth
    const currentRevenue = thisMonthRevenue._sum.total || 0
    const previousRevenue = lastMonthRevenue._sum.total || 0
    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0

    // Get total products count
    const totalProducts = await prisma.product.count()

    // Get new products this month
    const newProductsThisMonth = await prisma.product.count({
      where: {
        createdAt: {
          gte: thisMonth,
        },
      },
    })

    // Get total customers count
    const totalCustomers = await prisma.customer.count()

    // Get new customers this month
    const newCustomersThisMonth = await prisma.customer.count({
      where: {
        createdAt: {
          gte: thisMonth,
        },
      },
    })

    // Get recent sales (last 5 bills)
    const recentSales = await prisma.bill.findMany({
      where: {
        status: "PAID",
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    })

    // Get monthly revenue data for the chart (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    
    const monthlyBills = await prisma.bill.findMany({
      where: {
        status: "PAID",
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
    })

    // Group by month
    const monthlyData = monthlyBills.reduce((acc: any, bill: any) => {
      const month = bill.createdAt.toISOString().slice(0, 7) // YYYY-MM format
      if (!acc[month]) {
        acc[month] = { name: new Date(month + "-01").toLocaleDateString("en-US", { month: "short" }), total: 0 }
      }
      acc[month].total += bill.total
      return acc
    }, {})

    // Fill in missing months with zero values
    const months = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toISOString().slice(0, 7)
      const monthName = date.toLocaleDateString("en-US", { month: "short" })
      
      if (monthlyData[monthKey]) {
        months.push(monthlyData[monthKey])
      } else {
        months.push({ name: monthName, total: 0 })
      }
    }

    // Get total sales count
    const totalSales = await prisma.bill.count({
      where: {
        status: "PAID",
      },
    })

    return NextResponse.json({
      metrics: {
        totalRevenue: totalRevenue._sum.total || 0,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10, // Round to 1 decimal
        totalProducts,
        newProductsThisMonth,
        totalCustomers,
        newCustomersThisMonth,
        totalSales,
      },
      chartData: months,
      recentSales: recentSales.map(sale => ({
        id: sale.id,
        customerName: sale.customer?.name || "Unknown Customer",
        customerEmail: sale.customer?.email || "",
        amount: sale.total,
        date: sale.createdAt,
      })),
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 