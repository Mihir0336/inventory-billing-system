"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductDialog } from "@/components/products/product-dialog"
import { Plus, Search, Package, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCurrency } from "@/components/ui/currency-context";

interface Product {
  id: string
  name: string
  description?: string
  sku: string
  price: number
  cost: number
  stock: number
  minStock: number
  category: string
  image?: string
  createdAt: string
  updatedAt: string
}

export default function ProductsPage() {
  const { symbol } = useCurrency();
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else {
        throw new Error("Failed to fetch products")
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProductSave = async (productData: any) => {
    try {
      const url = selectedProduct ? `/api/products/${selectedProduct.id}` : "/api/products"
      const method = selectedProduct ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Product ${selectedProduct ? "updated" : "created"} successfully`,
        })
        fetchProducts()
        setIsDialogOpen(false)
        setSelectedProduct(null)
      } else {
        throw new Error("Failed to save product")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      })
    }
  }

  const handleProductDelete = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        })
        fetchProducts()
      } else {
        throw new Error("Failed to delete product")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const lowStockProducts = products.filter((product) => product.stock <= product.minStock)

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Products
          </h2>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Package className="h-8 w-8 animate-pulse text-primary" />
          <span className="ml-2 text-muted-foreground">Loading products...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Products
          </h2>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button className="btn-primary flex items-center gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-5 w-5" />
          Add Product
        </Button>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="card-gradient border-warning/20">
          <CardHeader>
            <CardTitle className="flex items-center text-warning">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription className="text-warning/80">
              {lowStockProducts.length} product(s) are running low on stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex justify-between items-center">
                  <span className="font-medium">{product.name}</span>
                  <Badge variant="secondary" className="badge-warning">
                    {product.stock} left
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-enhanced pl-10"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="card-gradient cursor-pointer hover:shadow-lg transition-all duration-200 animate-fade-in">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {product.name}
                  </CardTitle>
                  <CardDescription>{product.sku}</CardDescription>
                </div>
                <Badge variant={product.stock <= product.minStock ? "secondary" : "secondary"} className={product.stock <= product.minStock ? "badge-warning" : ""}>
                  {product.stock} in stock
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Price:</span>
                  <span className="font-medium">{symbol}{product.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cost:</span>
                  <span className="font-medium">{symbol}{product.cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Updated:</span>
                  <span className="font-medium">{new Date(product.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button className="btn-primary flex-1" onClick={() => { setSelectedProduct(product); setIsDialogOpen(true); }}>
                  Edit
                </Button>
                <Button className="btn-destructive flex-1" onClick={() => handleProductDelete(product.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ProductDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setSelectedProduct(null)
        }}
        product={selectedProduct}
        onSave={handleProductSave}
      />
    </div>
  )
}
