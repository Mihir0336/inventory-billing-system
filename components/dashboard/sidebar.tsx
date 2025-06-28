"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, Users, FileText, BarChart3, Settings, User, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Bills", href: "/dashboard/bills", icon: FileText },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={cn(
      "bg-gradient-to-b from-background via-background to-muted/20 border-r border-border/50 backdrop-blur-sm transition-all duration-300 ease-in-out",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Inventory Pro
            </h1>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-12"></div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-muted/50 transition-all duration-200 rounded-lg"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="mt-6 px-3">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center transition-all duration-200",
                  collapsed
                    ? "justify-center my-2"
                    : "px-3 py-3 text-sm font-medium rounded-xl relative overflow-hidden"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-lg transition-all duration-200",
                    collapsed
                      ? "p-2"
                      : "p-2 mr-3",
                    isActive
                      ? collapsed
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "bg-primary/20 text-primary"
                      : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}
                  style={{
                    width: 40,
                    height: 40,
                  }}
              >
                  <item.icon className="h-6 w-6" />
                </div>
                {!collapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
                {!collapsed && isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/60 rounded-r-full" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom section for additional info */}
      {!collapsed && (
        <div className="absolute bottom-4 left-3 right-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">System Online</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
