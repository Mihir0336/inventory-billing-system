"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BadgeCheck, Printer, Download, X, Building2, User, Calendar, Hash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BillItem {
  id: string
  productId: string
  quantity: number
  price: number
  total: number
  product: {
    id: string
    name: string
    sku: string
  }
}

interface Bill {
  id: string
  billNumber: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
    address: string
  } | null
  user: {
    id: string
    name: string
  }
  subtotal: number
  tax: number
  discount: number
  total: number
  status: "PENDING" | "PAID" | "CANCELLED"
  createdAt: string
  updatedAt: string
  items: BillItem[]
}

interface BillViewProps {
  billId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange?: () => void
}

export function BillView({ billId, open, onOpenChange, onStatusChange }: BillViewProps) {
  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && billId) {
      fetchBill()
    }
  }, [open, billId])

  const fetchBill = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/bills/${billId}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch bill")
      }

      const billData = await response.json()
      setBill(billData)
    } catch (error) {
      console.error("Error fetching bill:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-green-100 border border-green-300 text-green-900 font-semibold text-base shadow-sm dark:bg-green-900 dark:border-green-700 dark:text-green-200">
            <BadgeCheck className="h-5 w-5 text-green-700 dark:text-green-200" />
            Paid
          </span>
        )
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800 font-semibold text-base px-4 py-1 rounded-full dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800 font-semibold text-base px-4 py-1 rounded-full dark:bg-red-900 dark:text-red-200">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // TODO: Implement PDF download
    console.log("Download PDF functionality to be implemented")
  }

  const markAsPaid = async () => {
    if (!bill) return
    setUpdating(true)
    try {
      const response = await fetch(`/api/bills/${bill.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" })
      })
      if (!response.ok) throw new Error("Failed to update bill status")
      toast({ title: "Success", description: "Bill marked as paid." })
      // Instantly update the bill status in UI
      setBill(prev => prev ? { ...prev, status: "PAID" } : prev)
      if (onStatusChange) onStatusChange()
      // Optionally, re-fetch the bill for latest data
      // await fetchBill()
    } catch (error) {
      toast({ title: "Error", description: "Could not mark bill as paid.", variant: "destructive" })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Loading Bill...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!bill) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bill Not Found</DialogTitle>
            <DialogDescription>
              The requested bill could not be found.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-none print:overflow-visible scrollbar-hide">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center justify-between">
            <span className="text-2xl font-bold flex items-center gap-2">
              Bill Details
              {bill && (
                <span className="ml-2">{getStatusBadge(bill.status)}</span>
              )}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 print:space-y-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">INVENTORY BILLING SYSTEM</h1>
              </div>
              <p className="text-muted-foreground">Professional Invoice</p>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                <span className="font-semibold">{bill.billNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(bill.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Customer & User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-50 border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5" /> Customer</CardTitle>
                <CardDescription className="dark:text-zinc-200">{bill.customer?.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm dark:text-zinc-200">
                <div>Email: {bill.customer?.email}</div>
                <div>Phone: {bill.customer?.phone}</div>
                <div>Address: {bill.customer?.address}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5" /> Created By</CardTitle>
                <CardDescription className="dark:text-zinc-200">{bill.user?.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm dark:text-zinc-200">
                <div>Created: {new Date(bill.createdAt).toLocaleString()}</div>
                <div>Updated: {new Date(bill.updatedAt).toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-zinc-900 dark:border-zinc-700">
            <h2 className="text-lg font-semibold mb-2 dark:text-zinc-100">Bill Items</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="dark:text-zinc-300">Product</TableHead>
                  <TableHead className="dark:text-zinc-300">SKU</TableHead>
                  <TableHead className="dark:text-zinc-300">Quantity</TableHead>
                  <TableHead className="dark:text-zinc-300">Price</TableHead>
                  <TableHead className="dark:text-zinc-300">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bill.items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="dark:text-zinc-200">{item.product.name}</TableCell>
                    <TableCell className="dark:text-zinc-200">{item.product.sku}</TableCell>
                    <TableCell className="dark:text-zinc-200">{item.quantity}</TableCell>
                    <TableCell className="dark:text-zinc-200">₹{item.price.toFixed(2)}</TableCell>
                    <TableCell className="dark:text-zinc-200">₹{item.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals & Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-t pt-4">
            <div className="space-y-2">
              {bill.status !== "PAID" && (
                <Button
                  onClick={markAsPaid}
                  disabled={updating}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-full shadow-md transition"
                >
                  <BadgeCheck className="h-5 w-5 mr-2" />
                  {updating ? "Marking as Paid..." : "Mark as Paid"}
                </Button>
              )}
            </div>
            <div className="space-y-1 text-right dark:text-zinc-100">
              <div>Subtotal: <span className="font-semibold">₹{bill.subtotal.toFixed(2)}</span></div>
              <div>Tax: <span className="font-semibold">₹{bill.tax.toFixed(2)}</span></div>
              <div>Discount: <span className="font-semibold">₹{bill.discount.toFixed(2)}</span></div>
              <div className="text-lg font-bold">Total: ₹{bill.total.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 