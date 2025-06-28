"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, Download, Loader2, Eye, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BillDialog } from "@/components/bills/bill-dialog"
import { BillView } from "@/components/bills/bill-view"

interface Bill {
  id: string
  billNumber: string
  customer: {
    id: string
    name: string
    email: string
  } | null
  total: number
  status: "PENDING" | "PAID" | "CANCELLED"
  createdAt: string
  user: {
    id: string
    name: string
  }
}

interface BillsResponse {
  bills: Bill[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const [billDialogOpen, setBillDialogOpen] = useState(false)
  const [billViewOpen, setBillViewOpen] = useState(false)
  const [selectedBillId, setSelectedBillId] = useState<string>("")
  const { toast } = useToast()

  const fetchBills = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      if (searchTerm) {
        params.append("search", searchTerm)
      }

      const response = await fetch(`/api/bills?${params}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch bills")
      }

      const data: BillsResponse = await response.json()
      setBills(data.bills)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching bills:", error)
      toast({
        title: "Error",
        description: "Failed to load bills. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBills()
  }, [pagination.page, statusFilter])

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }))
      fetchBills()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="badge-success">Paid</Badge>
      case "PENDING":
        return <Badge className="badge-warning">Pending</Badge>
      case "CANCELLED":
        return <Badge className="badge-destructive">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleCreateBill = () => {
    setBillDialogOpen(true)
  }

  const handleBillCreated = () => {
    fetchBills()
  }

  const handleViewBill = (billId: string) => {
    setSelectedBillId(billId)
    setBillViewOpen(true)
  }

  const handleExportBills = () => {
    toast({
      title: "Export Bills",
      description: "Export feature coming soon!",
    })
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Bills
          </h1>
          <p className="text-muted-foreground">Manage and track all your bills and invoices</p>
        </div>
        <div className="flex gap-2">
          <Button className="btn-secondary" variant="outline" onClick={handleExportBills}>
            <Download className="mr-2 h-5 w-5" />
            Export
          </Button>
          <Button className="btn-primary" onClick={handleCreateBill}>
            <Plus className="mr-2 h-5 w-5" />
            Create Bill
          </Button>
        </div>
      </div>

      <Card className="card-gradient animate-fade-in">
        <CardHeader>
          <CardTitle className="font-semibold text-foreground">All Bills</CardTitle>
          <CardDescription>View and manage all bills in your system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search bills by number or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-enhanced pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="input-enhanced w-[180px]">
                <Filter className="mr-2 h-5 w-5" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading bills...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="table-enhanced">
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill.id} className="transition-all duration-200 hover:bg-muted/30">
                      <TableCell className="font-semibold">{bill.billNumber}</TableCell>
                      <TableCell>
                        {bill.customer ? (
                          <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-primary" />
                            <span>{bill.customer.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">${bill.total.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(bill.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(bill.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button className="btn-primary" size="sm" onClick={() => handleViewBill(bill.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <BillDialog open={billDialogOpen} onOpenChange={setBillDialogOpen} onBillCreated={handleBillCreated} />
      <BillView open={billViewOpen} onOpenChange={setBillViewOpen} billId={selectedBillId} />
    </div>
  )
} 