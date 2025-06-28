"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock: number
}

interface BillItem {
  productId: string
  productName: string
  sku: string
  quantity: number
  price: number
  total: number
}

interface BillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBillCreated: () => void
}

export function BillDialog({ open, onOpenChange, onBillCreated }: BillDialogProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [subtotal, setSubtotal] = useState(0)
  const [tax, setTax] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [total, setTotal] = useState(0)
  const [paymentStatus, setPaymentStatus] = useState<"PENDING" | "PAID">("PENDING")
  const { toast } = useToast()

  // Fetch customers and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching customers and products...")
        const [customersRes, productsRes] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/products")
        ])

        console.log("Customers response status:", customersRes.status)
        console.log("Products response status:", productsRes.status)

        if (customersRes.ok) {
          const customersData = await customersRes.json()
          console.log("Customers data:", customersData)
          setCustomers(customersData.customers || [])
        } else {
          console.error("Failed to fetch customers:", await customersRes.text())
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json()
          console.log("Products data:", productsData)
          setProducts(productsData.products || [])
        } else {
          console.error("Failed to fetch products:", await productsRes.text())
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load customers and products. Please try again.",
          variant: "destructive",
        })
      }
    }

    if (open) {
      fetchData()
    }
  }, [open, toast])

  // Calculate totals when items change
  useEffect(() => {
    const newSubtotal = billItems.reduce((sum, item) => sum + item.total, 0)
    setSubtotal(newSubtotal)
    
    const taxAmount = newSubtotal * 0.1 // 10% tax
    setTax(taxAmount)
    
    const newTotal = newSubtotal + taxAmount - discount
    setTotal(newTotal)
  }, [billItems, discount])

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) {
      toast({
        title: "Error",
        description: "Please select a product and enter a valid quantity.",
        variant: "destructive",
      })
      return
    }

    const product = products.find(p => p.id === selectedProduct)
    if (!product) return

    if (quantity > product.stock) {
      toast({
        title: "Error",
        description: `Only ${product.stock} items available in stock.`,
        variant: "destructive",
      })
      return
    }

    const existingItemIndex = billItems.findIndex(item => item.productId === selectedProduct)
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...billItems]
      const newQuantity = updatedItems[existingItemIndex].quantity + quantity
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: newQuantity,
        total: newQuantity * updatedItems[existingItemIndex].price
      }
      setBillItems(updatedItems)
    } else {
      // Add new item
      const newItem: BillItem = {
        productId: selectedProduct,
        productName: product.name,
        sku: product.sku,
        quantity,
        price: product.price,
        total: quantity * product.price
      }
      setBillItems([...billItems, newItem])
    }

    setSelectedProduct("")
    setQuantity(1)
  }

  const handleRemoveItem = (index: number) => {
    setBillItems(billItems.filter((_, i) => i !== index))
  }

  const handleCreateBill = async () => {
    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "Please select a customer.",
        variant: "destructive",
      })
      return
    }

    if (billItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the bill.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: selectedCustomer,
          subtotal,
          tax,
          discount,
          total,
          items: billItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.total
          })),
          paymentStatus
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create bill")
      }

      toast({
        title: "Success",
        description: "Bill created successfully!",
      })

      // Reset form
      setSelectedCustomer("")
      setBillItems([])
      setSubtotal(0)
      setTax(0)
      setDiscount(0)
      setTotal(0)
      setPaymentStatus("PENDING")
      
      onBillCreated()
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating bill:", error)
      toast({
        title: "Error",
        description: "Failed to create bill. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedCustomer("")
    setBillItems([])
    setSubtotal(0)
    setTax(0)
    setDiscount(0)
    setTotal(0)
    setSelectedProduct("")
    setQuantity(1)
    setPaymentStatus("PENDING")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Bill</DialogTitle>
          <DialogDescription>
            Create a new bill by selecting a customer and adding products.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Selection */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer">Customer</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product Selection */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="product">Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - ${product.price} (Stock: {product.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddItem} disabled={!selectedProduct}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bill Items */}
          <div className="space-y-4">
            <Label>Bill Items</Label>
            {billItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items added yet
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-muted-foreground">{item.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>${item.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        {/* Bill Summary */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Subtotal</Label>
              <div className="text-lg font-semibold">${subtotal.toFixed(2)}</div>
            </div>
            <div>
              <Label>Tax (10%)</Label>
              <div className="text-lg font-semibold">${tax.toFixed(2)}</div>
            </div>
            <div>
              <Label>Discount</Label>
              <Input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full"
              />
            </div>
            <div>
              <Label>Total</Label>
              <div className="text-xl font-bold">${total.toFixed(2)}</div>
            </div>
          </div>
          
          <div className="mt-4">
            <Label>Payment Status</Label>
            <Select value={paymentStatus} onValueChange={(value: "PENDING" | "PAID") => setPaymentStatus(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateBill} disabled={loading || billItems.length === 0}>
            {loading ? "Creating..." : "Create Bill"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 