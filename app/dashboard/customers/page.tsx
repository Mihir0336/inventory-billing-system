"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CustomerDialog } from "@/components/customers/customer-dialog"
import { Plus, Search, Users, Mail, Phone, MapPin, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  createdAt: string
  updatedAt: string
  _count?: {
    bills: number
  }
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/customers")
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers || [])
      } else {
        throw new Error("Failed to fetch customers")
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCustomerSave = async (customerData: any) => {
    try {
      const url = selectedCustomer ? `/api/customers/${selectedCustomer.id}` : "/api/customers"
      const method = selectedCustomer ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Customer ${selectedCustomer ? "updated" : "created"} successfully`,
        })
        fetchCustomers()
        setIsDialogOpen(false)
        setSelectedCustomer(null)
      } else {
        throw new Error("Failed to save customer")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save customer",
        variant: "destructive",
      })
    }
  }

  const handleCustomerDelete = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) {
      return
    }

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Customer deleted successfully",
        })
        fetchCustomers()
      } else {
        throw new Error("Failed to delete customer")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      })
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm),
  )

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Customers
          </h2>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Users className="h-8 w-8 animate-pulse text-primary" />
          <span className="ml-2 text-muted-foreground">Loading customers...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Customers
          </h2>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <Button className="btn-primary flex items-center gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-5 w-5" />
          Add Customer
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-enhanced pl-10"
          />
        </div>
      </div>

      <Card className="card-gradient animate-fade-in">
        <CardHeader>
          <CardTitle className="font-semibold text-foreground">Customer List</CardTitle>
          <CardDescription>A list of all your customers and their information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="table-enhanced">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="transition-all duration-200 hover:bg-muted/30">
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                        <Users className="h-6 w-6 text-primary" />
                      <span>{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.email ? (
                      <div className="flex items-center space-x-2">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                        <span>{customer.email}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.phone ? (
                      <div className="flex items-center space-x-2">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                        <span>{customer.phone}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.address ? (
                      <div className="flex items-center space-x-2">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <span>{customer.address}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                      <span className="badge-success px-2 py-1 text-xs">
                        {customer._count?.bills || 0}
                      </span>
                  </TableCell>
                  <TableCell>
                      <div className="flex gap-2">
                        <Button className="btn-primary" size="sm" onClick={() => { setSelectedCustomer(customer); setIsDialogOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button className="btn-destructive" size="sm" onClick={() => handleCustomerDelete(customer.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </div>
        </CardContent>
      </Card>

      <CustomerDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setSelectedCustomer(null)
        }}
        customer={selectedCustomer}
        onSave={handleCustomerSave}
      />
    </div>
  )
}
