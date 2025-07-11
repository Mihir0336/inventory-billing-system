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
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCurrency } from "@/components/ui/currency-context";

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
  const { symbol } = useCurrency();
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

  // Pagination for customers/products
  const [customerPage, setCustomerPage] = useState(1)
  const [customerPages, setCustomerPages] = useState(1)
  const [productPage, setProductPage] = useState(1)
  const [productPages, setProductPages] = useState(1)
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Fetch customers and products with pagination
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingCustomers(true)
        setLoadingProducts(true)
        const [customersRes, productsRes] = await Promise.all([
          fetch(`/api/customers?page=${customerPage}&limit=10`),
          fetch(`/api/products?page=${productPage}&limit=10`)
        ])
        if (customersRes.ok) {
          const customersData = await customersRes.json()
          setCustomers(prev => customerPage === 1 ? customersData.customers : [...prev, ...customersData.customers])
          setCustomerPages(customersData.pagination.pages)
        }
        if (productsRes.ok) {
          const productsData = await productsRes.json()
          setProducts(prev => productPage === 1 ? productsData.products : [...prev, ...productsData.products])
          setProductPages(productsData.pagination.pages)
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load customers and products. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingCustomers(false)
        setLoadingProducts(false)
      }
    }
    if (open) {
      fetchData()
    }
  }, [open, customerPage, productPage])

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer Card */}
          <div className="col-span-1 space-y-4">
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <Label htmlFor="customer">Customer</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-48">
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id} className="flex flex-col items-start">
                        <span className="font-medium">{customer.name}</span>
                        <span className="text-xs text-muted-foreground">{customer.email}</span>
                      </SelectItem>
                    ))}
                    {customerPage < customerPages && (
                      <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setCustomerPage(p => p + 1)} disabled={loadingCustomers}>
                        {loadingCustomers ? "Loading..." : "Load More"}
                      </Button>
                    )}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            {/* Product Card */}
            <div className="rounded-lg border bg-card p-4 shadow-sm space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-48">
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id} className="flex flex-col items-start">
                        <span className="font-medium">{product.name} <span className="text-xs text-muted-foreground">({product.sku})</span></span>
                        <span className="text-xs text-muted-foreground">₹{product.price} | Stock: <span className={product.stock < 5 ? 'text-red-500 font-bold' : ''}>{product.stock}</span></span>
                      </SelectItem>
                    ))}
                    {productPage < productPages && (
                      <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setProductPage(p => p + 1)} disabled={loadingProducts}>
                        {loadingProducts ? "Loading..." : "Load More"}
                      </Button>
                    )}
                  </ScrollArea>
                </SelectContent>
              </Select>
              <div className="flex gap-2 mt-2">
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
                  <Button onClick={handleAddItem} disabled={!selectedProduct} className="mt-4">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bill Items Card */}
          <div className="col-span-2 space-y-4">
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <Label>Bill Items</Label>
              {billItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No items added yet
                </div>
              ) : (
                <div className="border rounded-lg overflow-x-auto">
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
                        <TableRow key={index} className="hover:bg-muted/30">
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-xs text-muted-foreground">{item.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{symbol}{item.price.toFixed(2)}</TableCell>
                          <TableCell>{symbol}{item.total.toFixed(2)}</TableCell>
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
        </div>

        {/* Sticky Bill Summary */}
        <div className="sticky bottom-0 left-0 right-0 bg-background border-t pt-4 z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div>
              <Label>Subtotal</Label>
              <div className="text-lg font-semibold">{symbol}{subtotal.toFixed(2)}</div>
            </div>
            <div>
              <Label>Tax (10%)</Label>
              <div className="text-lg font-semibold">{symbol}{tax.toFixed(2)}</div>
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
              <div className="text-xl font-bold">{symbol}{total.toFixed(2)}</div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleCreateBill} disabled={loading || !selectedCustomer || billItems.length === 0}>
              {loading ? "Creating..." : "Create Bill"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 