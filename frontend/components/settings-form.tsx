"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export function SettingsForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState("user_123")
  const [email, setEmail] = useState("user@example.com")
  const [notifications, setNotifications] = useState({
    commits: true,
    challenges: true,
    rewards: true,
    updates: false,
  })

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Success",
        description: "Notification preferences updated",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs defaultValue="profile" className="w-full max-w-2xl">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Manage your public profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-input border-border"
              />
              <p className="text-xs text-muted-foreground">Your public display name</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input border-border"
              />
              <p className="text-xs text-muted-foreground">For notifications and account recovery</p>
            </div>

            <div className="bg-card/50 border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                Your wallet address is permanently linked to your account and cannot be changed.
              </p>
            </div>

            <Button onClick={handleSaveProfile} disabled={isLoading} className="w-full">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Notifications Tab */}
      <TabsContent value="notifications" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Control how you receive updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              {
                key: "commits",
                label: "Commit Notifications",
                desc: "Get notified when your commits are verified",
              },
              {
                key: "challenges",
                label: "Challenge Alerts",
                desc: "Receive alerts when your commits are challenged",
              },
              {
                key: "rewards",
                label: "Reward Notifications",
                desc: "Get notified when you earn rewards",
              },
              {
                key: "updates",
                label: "Platform Updates",
                desc: "Receive news about new features and updates",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={(e) =>
                    setNotifications((prev) => ({
                      ...prev,
                      [item.key]: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 rounded border-border"
                />
              </div>
            ))}

            <Button onClick={handleSaveNotifications} disabled={isLoading} className="w-full">
              {isLoading ? "Saving..." : "Save Preferences"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Security Tab */}
      <TabsContent value="security" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm text-green-500 font-medium">Wallet Connected</p>
              <p className="text-xs text-green-500/70 mt-1">Your account is secured by your wallet</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
              <Button variant="outline" className="w-full bg-transparent">
                Enable 2FA
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Active Sessions</p>
              <div className="bg-card/50 rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">Current Session</p>
                    <p className="text-xs text-muted-foreground mt-1">Last active: just now</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Danger Zone</p>
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
