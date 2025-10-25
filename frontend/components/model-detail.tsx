"use client"

import { useState, useEffect } from "react"
import type { Model } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ModelDetailProps {
  modelId: string
}

export function ModelDetail({ modelId }: ModelDetailProps) {
  const [model, setModel] = useState<Model | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const mockModels: Record<string, Model> = {
      "gpt-4-turbo": {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        description: "Advanced language model with improved reasoning and code generation",
        creator: "OpenAI",
        trustScore: 9.8,
        totalCommits: 15234,
        verified: true,
        createdAt: Date.now() - 86400000 * 30,
      },
      "claude-3-opus": {
        id: "claude-3-opus",
        name: "Claude 3 Opus",
        description: "Most capable Claude model with enhanced reasoning abilities",
        creator: "Anthropic",
        trustScore: 9.7,
        totalCommits: 12456,
        verified: true,
        createdAt: Date.now() - 86400000 * 25,
      },
      "llama-2-70b": {
        id: "llama-2-70b",
        name: "Llama 2 70B",
        description: "Open-source large language model with strong performance",
        creator: "Meta",
        trustScore: 9.2,
        totalCommits: 8934,
        verified: true,
        createdAt: Date.now() - 86400000 * 20,
      },
      "mistral-large": {
        id: "mistral-large",
        name: "Mistral Large",
        description: "High-performance model optimized for efficiency",
        creator: "Mistral AI",
        trustScore: 8.9,
        totalCommits: 5678,
        verified: true,
        createdAt: Date.now() - 86400000 * 15,
      },
      "gemini-pro": {
        id: "gemini-pro",
        name: "Gemini Pro",
        description: "Multimodal model with strong reasoning capabilities",
        creator: "Google",
        trustScore: 9.5,
        totalCommits: 11234,
        verified: true,
        createdAt: Date.now() - 86400000 * 10,
      },
      "custom-model-1": {
        id: "custom-model-1",
        name: "Custom Fine-tuned Model",
        description: "Community-trained model for specialized tasks",
        creator: "BlockQuest Community",
        trustScore: 7.2,
        totalCommits: 234,
        verified: false,
        createdAt: Date.now() - 86400000 * 5,
      },
    }

    setTimeout(() => {
      const foundModel = mockModels[modelId]
      setModel(foundModel || null)
      setIsLoading(false)
    }, 300)
  }, [modelId])

  if (isLoading) {
    return <div className="animate-pulse space-y-4">Loading...</div>
  }

  if (!model) {
    return <div className="text-center py-12 text-muted-foreground">Model not found</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-3xl">{model.name}</CardTitle>
              <CardDescription className="text-base mt-2">by {model.creator}</CardDescription>
            </div>
            {model.verified && <Badge className="bg-green-500/20 text-green-500 text-base">Verified</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-muted-foreground">{model.description}</p>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-card/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-2">Trust Score</p>
              <p className="text-3xl font-bold text-primary">{model.trustScore.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">out of 10</p>
            </div>
            <div className="bg-card/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-2">Total Commits</p>
              <p className="text-3xl font-bold text-accent">{model.totalCommits.toLocaleString()}</p>
            </div>
            <div className="bg-card/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-2">Created</p>
              <p className="text-sm font-semibold text-foreground">{new Date(model.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="bg-card/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-2">Model ID</p>
              <p className="text-sm font-mono text-foreground break-all">{model.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="commits" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="commits">Recent Commits</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="commits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Commits</CardTitle>
              <CardDescription>Latest commits registered for this model</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border"
                  >
                    <div>
                      <p className="text-sm font-mono text-foreground">
                        0x{Math.random().toString(16).slice(2, 18)}...
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(Date.now() - Math.random() * 86400000 * 7).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">Verified</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Challenges</CardTitle>
              <CardDescription>Ongoing disputes and challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">No active challenges</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Model performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-card/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Verification Rate</p>
                  <p className="text-2xl font-bold text-foreground">98.5%</p>
                </div>
                <div className="bg-card/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Challenge Success Rate</p>
                  <p className="text-2xl font-bold text-foreground">2.1%</p>
                </div>
                <div className="bg-card/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Avg. Commits/Day</p>
                  <p className="text-2xl font-bold text-foreground">507</p>
                </div>
                <div className="bg-card/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Total Staked</p>
                  <p className="text-2xl font-bold text-foreground">2.5M</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
