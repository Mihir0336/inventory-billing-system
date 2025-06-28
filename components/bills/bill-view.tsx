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
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><BadgeCheck className="h-3 w-3" />Paid</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
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
      fetchBill()
      if (onStatusChange) onStatusChange()
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
            <span>Bill Details</span>
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

        <div className="space-y-6 print:space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-6 w-6" />
                <h1 className="text-2xl font-bold">INVENTORY BILLING SYSTEM</h1>
              </div>
              <p className="text-muted-foreground">Professional Invoice</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-4 w-4" />
                <span className="font-semibold">{bill.billNumber}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(bill.createdAt).toLocaleDateString()}</span>
              </div>
              {getStatusBadge(bill.status)}
            </div>
          </div>

          {/* Customer and Bill Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bill.customer ? (
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold">Name:</span> {bill.customer.name}
                    </div>
                    {bill.customer.email && (
                      <div>
                        <span className="font-semibold">Email:</span> {bill.customer.email}
                      </div>
                    )}
                    {bill.customer.phone && (
                      <div>
                        <span className="font-semibold">Phone:</span> {bill.customer.phone}
                      </div>
                    )}
                    {bill.customer.address && (
                      <div>
                        <span className="font-semibold">Address:</span> {bill.customer.address}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No customer information</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bill Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Bill Number:</span> {bill.billNumber}
                  </div>
                  <div>
                    <span className="font-semibold">Date:</span> {new Date(bill.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-semibold">Created By:</span> {bill.user.name}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span> {getStatusBadge(bill.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bill Items */}
          <Card>
            <CardHeader>
              <CardTitle>Bill Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bill.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.product.name}</div>
                      </TableCell>
                      <TableCell>{item.product.sku}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Bill Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Bill Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${bill.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%):</span>
                  <span>${bill.tax.toFixed(2)}</span>
                </div>
                {bill.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-${bill.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-bold text-lg">
                  <span>Total:</span>
                  <span>${bill.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mark as Paid Button */}
          {bill.status === "PENDING" && (
            <Button
              className="mt-2"
              onClick={markAsPaid}
              disabled={updating}
              variant="default"
            >
              {updating ? "Marking as Paid..." : "Mark as Paid"}
            </Button>
          )}

          {/* Footer */}
          <div className="text-center text-muted-foreground text-sm border-t pt-4">
            <p>Thank you for your business!</p>
            <p>This is a computer-generated invoice.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 