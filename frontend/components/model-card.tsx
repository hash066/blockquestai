"use client"

import Link from "next/link"
import type { Model } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ModelCardProps {
  model: Model
}

export function ModelCard({ model }: ModelCardProps) {
  return (
    <Card className="hover:border-primary/50 transition">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{model.name}</CardTitle>
            <CardDescription className="text-xs mt-1">by {model.creator}</CardDescription>
          </div>
          {model.verified && <Badge className="bg-green-500/20 text-green-500">Verified</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{model.description}</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Trust Score</p>
            <p className="text-lg font-semibold text-foreground">{model.trustScore.toFixed(1)}</p>
          </div>
          <div className="bg-card/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Total Commits</p>
            <p className="text-lg font-semibold text-foreground">{model.totalCommits}</p>
          </div>
        </div>

        <Button asChild className="w-full">
          <Link href={`/models/${model.id}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
