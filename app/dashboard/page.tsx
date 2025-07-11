"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { DollarSign, Package, Users, TrendingUp, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { useCurrency } from "@/components/ui/currency-context";

interface DashboardData {
  metrics: {
    totalRevenue: number
    revenueGrowth: number
    totalProducts: number
    newProductsThisMonth: number
    totalCustomers: number
    newCustomersThisMonth: number
    totalSales: number
  }
  chartData: Array<{
    name: string
    total: number
  }>
  recentSales: Array<{
    id: string
    customerName: string
    customerEmail: string
    amount: number
    date: string
  }>
}

export default function Dashboard() {
  const { symbol } = useCurrency();
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard")
      
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data")
      }

      const dashboardData: DashboardData = await response.json()
      setData(dashboardData)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-muted-foreground">Here's an overview of your business</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-muted-foreground font-medium">Loading dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-muted-foreground">Here's an overview of your business</p>
        </div>
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">Dashboard data not available.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          Dashboard
        </h2>
        <p className="text-muted-foreground">Here's an overview of your business performance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-gradient hover:shadow-lg transition-all duration-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 group-hover:border-primary/30 transition-all duration-200">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{symbol}{data.metrics.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center space-x-2 mt-2">
              {data.metrics.revenueGrowth >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-success" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-destructive" />
              )}
              <p className={`text-xs font-medium ${data.metrics.revenueGrowth >= 0 ? 'text-success' : 'text-destructive'}`}>
                {data.metrics.revenueGrowth >= 0 ? '+' : ''}{data.metrics.revenueGrowth}% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient hover:shadow-lg transition-all duration-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-success/20 to-success/10 border border-success/20 group-hover:border-success/30 transition-all duration-200">
              <Package className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{data.metrics.totalProducts.toLocaleString()}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                +{data.metrics.newProductsThisMonth} new this month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient hover:shadow-lg transition-all duration-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-warning/20 to-warning/10 border border-warning/20 group-hover:border-warning/30 transition-all duration-200">
              <Users className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{data.metrics.totalCustomers.toLocaleString()}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                +{data.metrics.newCustomersThisMonth} new this month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient hover:shadow-lg transition-all duration-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 group-hover:border-primary/30 transition-all duration-200">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{data.metrics.totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">All time sales</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Revenue Overview</span>
            </CardTitle>
            <CardDescription>Monthly revenue performance</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={data.chartData} />
          </CardContent>
        </Card>
        <Card className="col-span-3 card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Recent Sales</span>
            </CardTitle>
            <CardDescription>Latest transactions and customer activity</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales sales={data.recentSales} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
