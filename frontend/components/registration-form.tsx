"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/src/contexts/WalletContext"
import { useDemo } from "@/lib/demo-context"
import { hashPrompt } from "@/lib/crypto-utils"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export function RegistrationForm() {
  const router = useRouter()
  const { address } = useWallet()
  const { isDemoMode, addCommit } = useDemo()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"input" | "review" | "confirm">("input")
  const [formData, setFormData] = useState({
    prompt: "",
    modelId: "",
    output: "",
  })
  const [promptHash, setPromptHash] = useState<string>("")
  const [commitId, setCommitId] = useState<string>("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleReview = async () => {
    if (!formData.prompt || !formData.modelId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const hash = await hashPrompt(formData.prompt)
      setPromptHash(hash)
      setStep("review")
      toast({
        title: "Success",
        description: "Prompt hashed successfully",
      })
    } catch (error) {
      console.error("Hash error:", error)
      toast({
        title: "Error",
        description: "Failed to hash prompt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    setIsLoading(true)
    try {
      let id: string

      if (isDemoMode) {
        const demoAddress = "0xDemo" + Math.random().toString(16).slice(2, 10)
        id = await addCommit({
          promptHash,
          prompt: formData.prompt,
          modelId: formData.modelId,
          output: formData.output,
          address: demoAddress,
          signature: "0xdemo" + Math.random().toString(16).slice(2),
        })

        toast({
          title: "Success",
          description: "Commit registered in demo mode",
        })
      } else {
        // Production mode: use wallet signing
        const signature = "0x" + Math.random().toString(16).slice(2)

        await apiClient.registerCommit({
          promptHash,
          signature,
          modelId: formData.modelId,
          prompt: formData.prompt,
          address: address!,
        })

        id = promptHash

        toast({
          title: "Success",
          description: "Commit registered successfully",
        })
      }

      setCommitId(id)
      setStep("confirm")
      setTimeout(() => {
        router.push("/verify")
      }, 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register commit",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (step === "input") {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Register a Commit</CardTitle>
          <CardDescription>Create a cryptographic proof of your AI model output</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Model ID</label>
            <Input
              name="modelId"
              placeholder="e.g., gpt-4-turbo"
              value={formData.modelId}
              onChange={handleInputChange}
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Prompt</label>
            <Textarea
              name="prompt"
              placeholder="Enter the prompt you sent to the model..."
              value={formData.prompt}
              onChange={handleInputChange}
              rows={4}
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Model Output (Optional)</label>
            <Textarea
              name="output"
              placeholder="The model's response (for reference only)"
              value={formData.output}
              onChange={handleInputChange}
              rows={4}
              className="bg-input border-border"
            />
          </div>

          <div className="bg-card/50 border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Your prompt will be hashed locally using SHA-256. The hash will be signed and registered on-chain.
            </p>
          </div>

          {isDemoMode && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-400">
                You are in demo mode. Your commits will be stored locally and can be verified within this session.
              </p>
            </div>
          )}

          <Button onClick={handleReview} disabled={isLoading} className="w-full">
            {isLoading ? "Processing..." : "Review & Hash"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (step === "review") {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Review Your Commit</CardTitle>
          <CardDescription>Verify the details before registering</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="bg-card/50 border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Model ID</p>
              <p className="text-foreground font-mono text-sm">{formData.modelId}</p>
            </div>

            <div className="bg-card/50 border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Prompt Hash (SHA-256)</p>
              <p className="text-foreground font-mono text-sm break-all">{promptHash}</p>
            </div>

            <div className="bg-card/50 border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Your Address</p>
              <p className="text-foreground font-mono text-sm">{isDemoMode ? "0xDemo..." : address}</p>
            </div>

            <div className="bg-card/50 border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Prompt</p>
              <p className="text-foreground text-sm">{formData.prompt}</p>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-foreground">
              By confirming, you're registering this commit on-chain. This action is permanent and will be visible to
              all users.
            </p>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep("input")} className="flex-1">
              Back
            </Button>
            <Button onClick={handleRegister} disabled={isLoading} className="flex-1">
              {isLoading ? "Registering..." : "Confirm & Register"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-green-500">Commit Registered Successfully</CardTitle>
        <CardDescription>Your proof has been anchored on-chain</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-card/50 border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Commit ID</p>
          <p className="text-foreground font-mono text-sm break-all">{commitId}</p>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Prompt Hash</p>
          <p className="text-foreground font-mono text-sm break-all">{promptHash}</p>
        </div>

        {isDemoMode && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-400">
              Demo commit saved. You can now verify it in the Verify section or stake on it in the Staking dashboard.
            </p>
          </div>
        )}

        <p className="text-sm text-muted-foreground">Redirecting to verify page in a moment...</p>

        <Button asChild className="w-full">
          <a href="/verify">Go to Verify</a>
        </Button>
      </CardContent>
    </Card>
  )
}
