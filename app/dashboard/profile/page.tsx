"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Camera, Edit, Save, X, User, Mail, Phone, MapPin, Calendar, Shield, Loader2 } from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  image: string | null
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState<UserProfile | null>(null)
  const [tempData, setTempData] = useState<UserProfile | null>(null)
  const { toast } = useToast()

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/profile")
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile")
      }

      const userData: UserProfile = await response.json()
      setProfileData(userData)
      setTempData(userData)
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleEdit = () => {
    if (profileData) {
      setTempData(profileData)
      setIsEditing(true)
    }
  }

  const handleSave = async () => {
    if (!tempData) return

    try {
      setSaving(true)
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: tempData.name,
          email: tempData.email,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update profile")
      }

      const updatedProfile: UserProfile = await response.json()
      setProfileData(updatedProfile)
      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profileData) {
      setTempData(profileData)
      setIsEditing(false)
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (tempData) {
      setTempData(prev => prev ? { ...prev, [field]: value } : null)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-red-100 text-red-800">Admin</Badge>
      case "STAFF":
        return <Badge className="bg-blue-100 text-blue-800">Staff</Badge>
      default:
        return <Badge>{role}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account profile and settings</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading profile...</span>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account profile and settings</p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Profile data not available.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account profile and settings</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="relative mx-auto mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileData.image || ""} alt={profileData.name} />
                <AvatarFallback>{profileData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  variant="outline"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            <CardTitle className="text-xl">{profileData.name}</CardTitle>
            <CardDescription>{profileData.email}</CardDescription>
            <div className="mt-2">
              {getRoleBadge(profileData.role)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Member since</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(profileData.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Account Status</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={isEditing ? (tempData?.name || "") : profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={isEditing ? (tempData?.email || "") : profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value="+1 (555) 123-4567"
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Role
                </Label>
                <Input
                  id="role"
                  value={profileData.role}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </Label>
              <Input
                id="address"
                value="123 Main Street, City, State 12345"
                disabled
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Password</h4>
              <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
            </div>
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Button variant="outline" size="sm">
              Enable 2FA
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Active Sessions</h4>
              <p className="text-sm text-muted-foreground">Manage your active login sessions</p>
            </div>
            <Button variant="outline" size="sm">
              View Sessions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent account activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Profile updated</p>
                <p className="text-sm text-muted-foreground">You updated your profile information</p>
              </div>
              <p className="text-sm text-muted-foreground">2 hours ago</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Password changed</p>
                <p className="text-sm text-muted-foreground">You changed your account password</p>
              </div>
              <p className="text-sm text-muted-foreground">1 week ago</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-gray-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Account created</p>
                <p className="text-sm text-muted-foreground">Your account was created</p>
              </div>
              <p className="text-sm text-muted-foreground">1 month ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 