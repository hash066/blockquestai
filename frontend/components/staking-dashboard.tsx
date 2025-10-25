"use client"

import { useState, useEffect } from "react"
import { useDemo } from "@/lib/demo-context"
import { apiClient } from "@/lib/api-client"
import { useWallet } from "@/src/contexts/WalletContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function StakingDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stakeAmount, setStakeAmount] = useState("")
  const [commitIdInput, setCommitIdInput] = useState("")
  const [prediction, setPrediction] = useState<"correct" | "incorrect" | null>(null)
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null)
  const [selectedCommit, setSelectedCommit] = useState<any>(null)
  const [stakes, setStakes] = useState<any[]>([])
  const [challenges, setChallenges] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { isDemoMode, commits, stakes: demoStakes, challenges: demoChallenges, addStake, respondToChallenge } = useDemo()
  const { address } = useWallet()
  const { toast } = useToast()

  useEffect(() => {
    if (isDemoMode) {
      setStakes(demoStakes)
      setChallenges(demoChallenges)
    } else if (address) {
      loadData()
    }
  }, [isDemoMode, demoStakes, demoChallenges, address])

  useEffect(() => {
    if (commitIdInput && !isDemoMode) {
      fetchCommit(commitIdInput)
    } else {
      setSelectedCommit(null)
    }
  }, [commitIdInput, isDemoMode])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [stakesResponse, challengesResponse] = await Promise.all([
        apiClient.getUserStakes(address!),
        apiClient.getUserChallenges(address!)
      ])
      setStakes((stakesResponse as any).data)
      setChallenges((challengesResponse as any).data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCommit = async (commitId: string) => {
    try {
      const response = await apiClient.getCommit(commitId)
      setSelectedCommit((response as any).data)
    } catch (error) {
      setSelectedCommit(null)
    }
  }

  // Map Supabase fields to frontend expected fields
  const mappedStakes = stakes.map(stake => ({
    ...stake,
    commitId: stake.commit_id,
    address: stake.user_address,
    createdAt: stake.created_at,
    expiresAt: stake.expires_at,
    commitHash: stake.commit_id,
    model: stake.model_id || 'Unknown',
    prompt: stake.prompt || '',
    amount: stake.amount,
    prediction: stake.prediction,
    status: stake.status,
  }))

  const mappedChallenges = challenges.map(challenge => ({
    ...challenge,
    commitId: challenge.commit_id,
    address: challenge.user_address,
    createdAt: challenge.created_at,
    stakeAmount: challenge.stake_amount,
    reason: challenge.reason,
    status: challenge.status,
    commitHash: challenge.commit_id,
    prompt: challenge.prompt || '',
  }))

  const userStats = {
    totalStaked: mappedStakes.reduce((sum, s) => sum + Number.parseFloat(s.amount || "0"), 0).toFixed(2),
    activeStakes: mappedStakes.filter((s) => s.status === "active").length,
    pendingRewards: "2,450",
    totalEarnings: "18,750",
  }

  const handlePlaceStake = () => {
    if (!commitIdInput || !stakeAmount || !prediction) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    if (isDemoMode) {
      const commit = commits.find((c) => c.id === commitIdInput || c.promptHash === commitIdInput)
      if (!commit) {
        toast({
          title: "Error",
          description: "Commit not found",
          variant: "destructive",
        })
        return
      }

      addStake({
        commitId: commit.id,
        commitHash: commit.promptHash,
        prompt: commit.prompt,
        model: commit.modelId,
        amount: stakeAmount,
        prediction,
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      })

      toast({
        title: "Success",
        description: "Stake placed successfully in demo mode",
      })

      setCommitIdInput("")
      setStakeAmount("")
      setPrediction(null)
      setActiveTab("overview")
    } else {
      // Non-demo mode: use API
      apiClient.createStake({
        commitId: commitIdInput,
        amount: stakeAmount,
        prediction,
        address: address!,
      }).then(() => {
        toast({
          title: "Success",
          description: "Stake placed successfully",
        })
        loadData()
        setCommitIdInput("")
        setStakeAmount("")
        setPrediction(null)
        setActiveTab("overview")
      }).catch((error) => {
        toast({
          title: "Error",
          description: "Failed to place stake",
          variant: "destructive",
        })
      })
    }
  }

  const handleRespondToChallenge = (challengeId: string) => {
    respondToChallenge(challengeId)
    toast({
      title: "Success",
      description: "Challenge response submitted",
    })
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Staked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">${userStats.totalStaked}</p>
            <p className="text-xs text-muted-foreground mt-1">Across {userStats.activeStakes} stakes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-accent">${userStats.pendingRewards}</p>
            <p className="text-xs text-muted-foreground mt-1">Awaiting resolution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">${userStats.totalEarnings}</p>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{mappedChallenges.filter((c) => c.status === "pending").length}</p>
            <p className="text-xs text-muted-foreground mt-1">Requiring action</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">My Stakes</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="new-stake">New Stake</TabsTrigger>
        </TabsList>

        {/* My Stakes Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Stakes</CardTitle>
              <CardDescription>Your current staking positions</CardDescription>
            </CardHeader>
            <CardContent>
              {mappedStakes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No stakes yet. Create one in the New Stake tab.</p>
              ) : (
                <div className="space-y-3">
                  {mappedStakes.map((stake) => (
                    <div
                      key={stake.id}
                      className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-foreground">{stake.model}</p>
                          <Badge variant="default" className="bg-green-500/20 text-green-500">
                            {stake.status}
                          </Badge>
                          <Badge variant="outline">{stake.prediction}</Badge>
                        </div>
                        <button
                          onClick={() => setSelectedPrompt(stake.prompt)}
                          className="text-xs text-muted-foreground font-mono mb-1 hover:text-primary transition cursor-pointer"
                        >
                          {stake.commitHash}
                        </button>
                        <p className="text-xs text-muted-foreground mb-2 italic">"{stake.prompt}"</p>
                        <p className="text-xs text-muted-foreground">Expires: {stake.expiresAt}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">${stake.amount}</p>
                        <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Challenges Against You</CardTitle>
              <CardDescription>Disputes and challenges to resolve</CardDescription>
            </CardHeader>
            <CardContent>
              {mappedChallenges.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active challenges.</p>
              ) : (
                <div className="space-y-3">
                  {mappedChallenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-foreground">Challenge from {challenge.challenger}</p>
                          <Badge
                            variant="destructive"
                            className={
                              challenge.status === "pending"
                                ? "bg-red-500/20 text-red-500"
                                : "bg-green-500/20 text-green-500"
                            }
                          >
                            {challenge.status}
                          </Badge>
                        </div>
                        <button
                          onClick={() => setSelectedPrompt(challenge.prompt)}
                          className="text-xs text-muted-foreground font-mono mb-1 hover:text-primary transition cursor-pointer"
                        >
                          {challenge.commitHash}
                        </button>
                        <p className="text-xs text-muted-foreground mb-2 italic">"{challenge.prompt}"</p>
                        <p className="text-xs text-muted-foreground mb-2">Reason: {challenge.reason}</p>
                        <p className="text-xs text-muted-foreground">Created: {challenge.createdAt}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">${challenge.stakeAmount}</p>
                        {challenge.status === "pending" && (
                          <Button size="sm" className="mt-2" onClick={() => handleRespondToChallenge(challenge.id)}>
                            Respond
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Stake Tab */}
        <TabsContent value="new-stake" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Stake</CardTitle>
              <CardDescription>Stake on a model output to earn rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isDemoMode && commits.length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-blue-400">
                    Available demo commits: {commits.length}. Use their IDs below.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Commit ID</label>
                <Input
                  placeholder={isDemoMode && commits.length > 0 ? commits[0].id : "0x..."}
                  value={commitIdInput}
                  onChange={(e) => setCommitIdInput(e.target.value)}
                  className="bg-input border-border"
                />
              </div>

              {selectedCommit && (
                <div className="bg-card/50 border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Model ID</p>
                  <p className="text-foreground font-mono text-sm">{selectedCommit.modelId}</p>
                  <p className="text-xs text-muted-foreground mb-1 mt-2">Prompt Hash</p>
                  <p className="text-foreground font-mono text-sm break-all">{selectedCommit.promptHash}</p>
                  <p className="text-xs text-muted-foreground mb-1 mt-2">Prompt</p>
                  <p className="text-foreground text-sm">{selectedCommit.prompt}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Stake Amount</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="bg-input border-border"
                  />
                  <Button variant="outline">Max</Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Prediction</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={prediction === "correct" ? "default" : "outline"}
                    className="h-12 bg-transparent"
                    onClick={() => setPrediction("correct")}
                  >
                    Correct
                  </Button>
                  <Button
                    variant={prediction === "incorrect" ? "default" : "outline"}
                    className="h-12 bg-transparent"
                    onClick={() => setPrediction("incorrect")}
                  >
                    Incorrect
                  </Button>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-foreground">
                  Estimated reward:{" "}
                  <span className="font-bold">${(Number.parseFloat(stakeAmount || "0") * 0.15).toFixed(2)}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-2">Based on current odds and model trust score</p>
              </div>

              <Button className="w-full" onClick={handlePlaceStake}>
                Place Stake
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedPrompt} onOpenChange={(open) => !open && setSelectedPrompt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prompt Details</DialogTitle>
            <DialogDescription>Full prompt text for this commit</DialogDescription>
          </DialogHeader>
          <div className="bg-card/50 rounded-lg p-4 border border-border">
            <p className="text-foreground whitespace-pre-wrap break-words">{selectedPrompt}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
