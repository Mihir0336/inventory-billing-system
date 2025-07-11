"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon, Plus, Search, Filter, Download, Loader2, Eye, Users, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BillDialog } from "@/components/bills/bill-dialog"
import { BillView } from "@/components/bills/bill-view"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { addDays, startOfDay, endOfDay } from 'date-fns'
import { useCurrency } from "@/components/ui/currency-context";

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

interface GroupedBills {
  [key: string]: Bill[]
}

export default function BillsPage() {
  const { symbol } = useCurrency();
  const [bills, setBills] = useState<Bill[]>([])
  const [groupedBills, setGroupedBills] = useState<GroupedBills>({})
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
  const today = new Date()
  const [showDateInputs, setShowDateInputs] = useState(false)
  const [inputFrom, setInputFrom] = useState<string>(startOfDay(today).toISOString().slice(0, 10))
  const [inputTo, setInputTo] = useState<string>(endOfDay(today).toISOString().slice(0, 10))
  const [isRangeActive, setIsRangeActive] = useState(false)
  // Change setBills to append when loading more
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  const groupBillsByDate = (bills: Bill[]) => {
    const grouped: GroupedBills = {}
    
    bills.forEach(bill => {
      const date = new Date(bill.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(bill)
    })
    
    return grouped
  }

  // By default, show only today's bills
  useEffect(() => {
    if (!isRangeActive) {
      setInputFrom(startOfDay(today).toISOString().slice(0, 10))
      setInputTo(endOfDay(today).toISOString().slice(0, 10))
    }
  }, [isRangeActive])

  const fetchBills = async (append = false) => {
    try {
      if (append) setIsLoadingMore(true)
      else setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: "desc",
      })
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      if (searchTerm) {
        params.append("search", searchTerm)
      }
      if (isRangeActive && inputFrom && inputTo) {
        params.append("from", new Date(inputFrom).toISOString())
        const toDate = new Date(inputTo)
        toDate.setHours(23, 59, 59, 999)
        params.append("to", toDate.toISOString())
      } else {
        params.append("from", startOfDay(today).toISOString())
        params.append("to", endOfDay(today).toISOString())
      }
      const response = await fetch(`/api/bills?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch bills")
      }
      const data: BillsResponse = await response.json()
      if (append) {
        setBills(prev => [...prev, ...data.bills])
        setGroupedBills(groupBillsByDate([...bills, ...data.bills]))
      } else {
        setBills(data.bills)
        setGroupedBills(groupBillsByDate(data.bills))
      }
      setPagination(data.pagination)
      setIsFirstLoad(false)
    } catch (error) {
      console.error("Error fetching bills:", error)
      toast({
        title: "Error",
        description: "Failed to load bills. Please try again.",
        variant: "destructive",
      })
    } finally {
      if (append) setIsLoadingMore(false)
      else setLoading(false)
    }
  }

  useEffect(() => {
    fetchBills(false)
  }, [pagination.page, statusFilter, inputFrom, inputTo, isRangeActive])

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
          <div className="flex gap-4 mb-6 flex-wrap items-center">
            {/* Date Range Filter Button and Inputs */}
            <Button variant={isRangeActive ? "default" : "outline"} size="sm" onClick={() => setShowDateInputs((v) => !v)}>
              {isRangeActive ? `${inputFrom} - ${inputTo}` : "Filter by Date Range"}
            </Button>
            {showDateInputs && (
              <div className="flex items-center gap-2">
                <label className="font-medium">From:</label>
                <input
                  type="date"
                  value={inputFrom}
                  onChange={e => setInputFrom(e.target.value)}
                  className="border rounded px-2 py-1"
                  max={inputTo}
                />
                <label className="font-medium">To:</label>
                <input
                  type="date"
                  value={inputTo}
                  onChange={e => setInputTo(e.target.value)}
                  className="border rounded px-2 py-1"
                  min={inputFrom}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    setIsRangeActive(true)
                    setShowDateInputs(false)
                  }}
                  disabled={!inputFrom || !inputTo}
                >
                  Apply
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsRangeActive(false)
                    setInputFrom(startOfDay(today).toISOString().slice(0, 10))
                    setInputTo(endOfDay(today).toISOString().slice(0, 10))
                    setShowDateInputs(false)
                  }}
                >
                  Reset
                </Button>
              </div>
            )}
            <div className="flex-1 min-w-[200px]">
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
            <div className="space-y-6">
              {Object.keys(groupedBills).length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No bills found</p>
                </div>
              ) : (
                Object.entries(groupedBills).map(([groupKey, dateBills]) => (
                  <div key={groupKey} className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">{groupKey}</h3>
                      <Badge variant="secondary" className="ml-2">
                        {dateBills.length} {dateBills.length === 1 ? 'bill' : 'bills'}
                      </Badge>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <Table className="table-enhanced">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Bill #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dateBills.map((bill) => (
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
                                <span className="font-medium">{symbol}{bill.total.toFixed(2)}</span>
                              </TableCell>
                              <TableCell>{getStatusBadge(bill.status)}</TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(bill.createdAt), "dd MMMM yyyy 'at' hh:mm a")}
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
                  </div>
                ))
              )}
            </div>
          )}
          {pagination.page < pagination.pages && (
            <div className="flex justify-center my-4">
              <Button
                onClick={() => {
                  setPagination(prev => ({ ...prev, page: prev.page + 1 }))
                  fetchBills(true)
                }}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <BillDialog open={billDialogOpen} onOpenChange={setBillDialogOpen} onBillCreated={handleBillCreated} />
      <BillView open={billViewOpen} onOpenChange={setBillViewOpen} billId={selectedBillId} onStatusChange={fetchBills} />
    </div>
  )
} 