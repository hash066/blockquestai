"use client"

import { useState } from "react"
import type { UserProfile } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface UserProfileProps {
  profile: UserProfile
}

export function UserProfileComponent({ profile }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const getTrustScoreBadge = (score: number) => {
    if (score >= 9) return "bg-green-500/20 text-green-500"
    if (score >= 7) return "bg-blue-500/20 text-blue-500"
    if (score >= 5) return "bg-yellow-500/20 text-yellow-500"
    return "bg-red-500/20 text-red-500"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-3xl">{profile.username || "Anonymous User"}</CardTitle>
              <CardDescription className="text-base mt-2 font-mono">{profile.address}</CardDescription>
            </div>
            <Badge className={getTrustScoreBadge(profile.trustScore)}>
              Trust Score: {profile.trustScore.toFixed(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-card/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-2">Total Commits</p>
              <p className="text-3xl font-bold text-foreground">{profile.totalCommits}</p>
            </div>
            <div className="bg-card/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-2">Total Staked</p>
              <p className="text-3xl font-bold text-accent">${profile.totalStaked}</p>
            </div>
            <div className="bg-card/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-2">Member Since</p>
              <p className="text-sm font-semibold text-foreground">{new Date(profile.joinedAt).toLocaleDateString()}</p>
            </div>
            <div className="bg-card/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-2">Account Status</p>
              <Badge className="bg-green-500/20 text-green-500">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-card/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Trust Score Breakdown</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Commit Accuracy</span>
                    <span className="text-sm font-semibold text-green-500">98.5%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "98.5%" }} />
                  </div>
                </div>
              </div>

              <div className="bg-card/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Challenge Success Rate</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Challenges Won</span>
                    <span className="text-sm font-semibold text-blue-500">87.3%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "87.3%" }} />
                  </div>
                </div>
              </div>

              <div className="bg-card/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Staking Performance</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Correct Predictions</span>
                    <span className="text-sm font-semibold text-accent">92.1%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: "92.1%" }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent actions on BlockQuest</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: "Registered commit", model: "GPT-4 Turbo", time: "2 hours ago" },
                  { action: "Placed stake", model: "Claude 3 Opus", time: "5 hours ago" },
                  { action: "Challenge resolved", model: "Llama 2 70B", time: "1 day ago" },
                  { action: "Registered commit", model: "Gemini Pro", time: "2 days ago" },
                  { action: "Earned reward", model: "Mistral Large", time: "3 days ago" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.model}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievements & Badges</CardTitle>
              <CardDescription>Milestones and accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { icon: "🏆", title: "Verified Expert", desc: "100+ verified commits" },
                  { icon: "⭐", title: "Trust Builder", desc: "Trust score above 9.0" },
                  { icon: "💰", title: "Staking Master", desc: "$100k+ staked" },
                  { icon: "🎯", title: "Accurate Predictor", desc: "90%+ prediction accuracy" },
                  { icon: "🛡️", title: "Challenge Champion", desc: "Won 50+ challenges" },
                  { icon: "🚀", title: "Early Adopter", desc: "Joined in first month" },
                ].map((achievement, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-border bg-card/50 hover:border-primary/50 transition text-center"
                  >
                    <p className="text-3xl mb-2">{achievement.icon}</p>
                    <p className="text-sm font-semibold text-foreground">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{achievement.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
