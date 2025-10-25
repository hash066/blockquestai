"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export function ChallengeForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    commitId: "",
    stakeAmount: "",
    reason: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.commitId || !formData.stakeAmount || !formData.reason) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Challenge created successfully",
      })

      setFormData({ commitId: "", stakeAmount: "", reason: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create challenge",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Challenge a Commit</CardTitle>
        <CardDescription>Dispute a model output and stake on the resolution</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Commit ID to Challenge</label>
          <Input
            name="commitId"
            placeholder="0x..."
            value={formData.commitId}
            onChange={handleChange}
            className="bg-input border-border"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Stake Amount</label>
          <Input
            name="stakeAmount"
            type="number"
            placeholder="Enter amount to stake"
            value={formData.stakeAmount}
            onChange={handleChange}
            className="bg-input border-border"
          />
          <p className="text-xs text-muted-foreground">You must stake at least as much as the original commit</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Reason for Challenge</label>
          <Textarea
            name="reason"
            placeholder="Explain why you believe this commit is incorrect..."
            value={formData.reason}
            onChange={handleChange}
            rows={4}
            className="bg-input border-border"
          />
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-sm text-yellow-600 font-medium">Important</p>
          <p className="text-sm text-yellow-600/80 mt-1">
            If your challenge is resolved against you, you will lose your stake. Challenges are resolved through
            community voting and on-chain arbitration.
          </p>
        </div>

        <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
          {isLoading ? "Creating Challenge..." : "Create Challenge"}
        </Button>
      </CardContent>
    </Card>
  )
}
