"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BadgeCheck, Printer, Download, X, Building2, User, Calendar, Hash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// @ts-ignore: No types for html2pdf.js
import html2pdf from 'html2pdf.js'

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
  const [originalTitle, setOriginalTitle] = useState<string | null>(null);

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

  const setPrintTitle = () => {
    if (!bill) return;
    const customerName = bill.customer?.name?.toLowerCase().replace(/\s+/g, '_') || 'invoice';
    const filename = `${customerName}_${bill.billNumber}`;
    setOriginalTitle(document.title);
    document.title = filename;
  };

  const restoreTitle = () => {
    if (originalTitle) {
      document.title = originalTitle;
    }
  };

  const handlePrint = () => {
    setPrintTitle();
    setTimeout(() => {
      window.print();
      setTimeout(restoreTitle, 1000);
    }, 100);
  };

  const handleDownload = () => {
    // TODO: Implement PDF download
    console.log("Download PDF functionality to be implemented")
  }

  const handleDownloadPDF = () => {
    if (!bill) return;
    // Compose filename: e.g. sarah_johnson_BILL-005.pdf
    const customerName = bill.customer?.name?.toLowerCase().replace(/\s+/g, '_') || 'invoice';
    const filename = `${customerName}_${bill.billNumber}.pdf`;
    // Find the print area
    const printArea = document.getElementById('bill-print-area');
    if (!printArea) return;
    html2pdf()
      .set({
        margin: 0,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      })
      .from(printArea)
      .save();
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" sideOffset={8}>Print this bill</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" sideOffset={8}>Download as PDF</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Print Header - only visible in print mode, but also used for PDF download */}
        <div id="bill-print-area" className="hidden print:block print:bg-gray-100 print:p-10">
          <div className="max-w-2xl mx-auto border-2 border-gray-700 rounded-xl shadow-xl p-10 bg-white">
            {/* Logo and Company Name */}
            <div className="flex items-center gap-4 mb-8">
              <img src="/placeholder-logo.png" alt="Company Logo" className="h-14 w-14 object-contain" />
              <div>
                <div className="text-4xl font-extrabold tracking-tight text-gray-900">INVENTORY BILLING SYSTEM</div>
                <div className="text-base text-gray-700 font-medium">Professional Invoice</div>
              </div>
              <div className="flex-1" />
              <div className="text-right">
                <div className="font-bold text-xl text-gray-900">Bill #: {bill.billNumber}</div>
                <div className="text-base text-gray-700">{new Date(bill.createdAt).toLocaleDateString()}</div>
                <div className="mt-2">{getStatusBadge(bill.status)}</div>
              </div>
            </div>
            {/* Customer & Issuer Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2"><User className='h-5 w-5'/> Customer</div>
                <div className="text-gray-900 font-semibold">{bill.customer?.name}</div>
                <div className="text-sm text-gray-700">Email: {bill.customer?.email}</div>
                <div className="text-sm text-gray-700">Phone: {bill.customer?.phone}</div>
                <div className="text-sm text-gray-700">Address: {bill.customer?.address}</div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2"><User className='h-5 w-5'/> Created By</div>
                <div className="text-gray-900 font-semibold">{bill.user?.name}</div>
                <div className="text-sm text-gray-700">Created: {new Date(bill.createdAt).toLocaleString()}</div>
                <div className="text-sm text-gray-700">Updated: {new Date(bill.updatedAt).toLocaleString()}</div>
              </div>
            </div>
            {/* Items Table */}
            <div className="mb-8">
              <div className="font-bold text-lg text-gray-800 mb-2">Bill Items</div>
              <table className="w-full border border-gray-300 rounded overflow-hidden">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-3 py-2 text-left text-gray-800">Product</th>
                    <th className="border px-3 py-2 text-left text-gray-800">SKU</th>
                    <th className="border px-3 py-2 text-right text-gray-800">Quantity</th>
                    <th className="border px-3 py-2 text-right text-gray-800">Price</th>
                    <th className="border px-3 py-2 text-right text-gray-800">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.items.map(item => (
                    <tr key={item.id}>
                      <td className="border px-3 py-1 text-gray-900">{item.product.name}</td>
                      <td className="border px-3 py-1 text-gray-900">{item.product.sku}</td>
                      <td className="border px-3 py-1 text-right text-gray-900">{item.quantity}</td>
                      <td className="border px-3 py-1 text-right text-gray-900">₹{item.price.toFixed(2)}</td>
                      <td className="border px-3 py-1 text-right text-gray-900">₹{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Totals */}
            <div className="flex justify-end mb-8">
              <table className="text-right bg-gray-50 border border-gray-200 rounded-lg p-4">
                <tbody>
                  <tr>
                    <td className="pr-4 font-bold text-gray-800 text-lg">Subtotal:</td>
                    <td className="text-gray-900 font-bold text-lg">₹{bill.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="pr-4 font-bold text-gray-800 text-lg">Tax:</td>
                    <td className="text-gray-900 font-bold text-lg">₹{bill.tax.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="pr-4 font-bold text-gray-800 text-lg">Discount:</td>
                    <td className="text-gray-900 font-bold text-lg">₹{bill.discount.toFixed(2)}</td>
                  </tr>
                  <tr className="text-2xl">
                    <td className="pr-4 font-extrabold text-gray-900">Total:</td>
                    <td className="text-gray-900 font-extrabold text-2xl">₹{bill.total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Footer */}
            <div className="text-center text-gray-700 text-base border-t pt-6 mt-8">
              <p className="font-semibold">Thank you for your business!</p>
              <p className="text-sm">For queries, contact: support@yourcompany.com | +91-12345-67890</p>
              <p className="text-xs mt-2">This is a computer-generated invoice.</p>
            </div>
          </div>
        </div>
        {/* End Print Header */}
        {/* Normal Dialog Content (hidden in print) */}
        <div className="space-y-8 print:hidden">
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