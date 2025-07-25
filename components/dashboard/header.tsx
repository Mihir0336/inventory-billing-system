"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { Bell, LogOut, Settings, User, Building2 } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [companyName, setCompanyName] = useState("My Company")
  const [notifications, setNotifications] = useState<any[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)

  const fetchCompanyName = async () => {
    try {
      const response = await fetch('/api/company')
      if (response.ok) {
        const data = await response.json()
        setCompanyName(data.companyName)
      }
    } catch (error) {
      console.error('Error fetching company name:', error)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchCompanyName()
    }
  }, [session])

  // Listen for company name updates from settings
  useEffect(() => {
    const handleCompanyNameUpdate = (event: CustomEvent) => {
      setCompanyName(event.detail.companyName)
    }

    window.addEventListener('companyNameUpdated', handleCompanyNameUpdate as EventListener)

    return () => {
      window.removeEventListener('companyNameUpdated', handleCompanyNameUpdate as EventListener)
    }
  }, [])

  // Refresh company name when navigating back from settings
  useEffect(() => {
    if (pathname === '/dashboard' && session?.user) {
      fetchCompanyName()
    }
  }, [pathname, session])

  // Redirect to sign-in if session is null (user deleted or logged out)
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // Fetch notifications (low stock)
  const fetchNotifications = async () => {
    setLoadingNotifications(true)
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      } else {
        setNotifications([])
      }
    } catch (e) {
      setNotifications([])
    } finally {
      setLoadingNotifications(false)
    }
  }

  return (
    <header className="bg-gradient-to-r from-background via-background to-muted/20 border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {companyName}
              </h2>
              <p className="text-sm text-muted-foreground font-medium">Inventory Management</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-muted/50 transition-colors duration-200"
                onClick={fetchNotifications}
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-pulse"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2">
              <DropdownMenuLabel className="font-semibold">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {loadingNotifications ? (
                <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">No notifications</div>
              ) : (
                notifications.map((notif) => (
                  <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 cursor-default">
                    <span className="font-medium">{notif.name}</span>
                    <span className="text-xs text-muted-foreground">Stock: {notif.stock} (Min: {notif.minStock})</span>
                    <span className="text-xs text-muted-foreground">Category: {notif.category}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full hover:bg-muted/50 transition-all duration-200 group"
              >
                <Avatar className="h-10 w-10 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-200">
                  <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                    {session?.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                        {session?.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold leading-none">{session?.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground mt-1">{session?.user?.email}</p>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => router.push("/dashboard/profile")}
                className="flex items-center space-x-2 p-3 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors duration-200"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push("/dashboard/settings")}
                className="flex items-center space-x-2 p-3 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors duration-200"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => signOut()}
                className="flex items-center space-x-2 p-3 cursor-pointer hover:bg-destructive/10 text-destructive rounded-lg transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
