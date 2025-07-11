import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar, DollarSign } from "lucide-react"
import { useCurrency } from "@/components/ui/currency-context";

interface Sale {
  id: string
  customerName: string
  customerEmail: string
  amount: number
  date: string
}

interface RecentSalesProps {
  sales: Sale[]
}

export function RecentSales({ sales }: RecentSalesProps) {
  const { symbol } = useCurrency();
  if (sales.length === 0) {
  return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">No recent sales found.</p>
        <p className="text-sm text-muted-foreground mt-1">Sales will appear here once you start creating bills.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sales.map((sale) => (
        <div 
          key={sale.id} 
          className="group flex items-center p-4 rounded-xl bg-gradient-to-r from-card to-card/80 border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-200"
        >
          <div className="relative">
            <Avatar className="h-10 w-10 ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all duration-200">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                {sale.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
        </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background flex items-center justify-center">
              <div className="w-2 h-2 bg-success-foreground rounded-full" />
        </div>
      </div>
          
          <div className="ml-4 flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold leading-none text-foreground">
                {sale.customerName}
              </p>
              <Badge variant="secondary" className="text-xs font-medium">
                <DollarSign className="h-3 w-3 mr-1" />
                +{symbol}{sale.amount.toLocaleString()}
              </Badge>
        </div>
            <div className="flex items-center space-x-4">
              <p className="text-xs text-muted-foreground flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(sale.date).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {sale.customerEmail}
              </p>
        </div>
      </div>
        </div>
      ))}
    </div>
  )
}
