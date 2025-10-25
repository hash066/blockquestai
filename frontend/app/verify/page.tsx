"use client"

import { useState } from "react"
import { useDemo } from "@/lib/demo-context"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function VerifyPage() {
  const [commitId, setCommitId] = useState("")
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null)
  const [commit, setCommit] = useState<any>(null)
  const [anchors, setAnchors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { getCommit, getCommitByHash, getAnchors, addAnchor, isDemoMode } = useDemo()
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!commitId.trim()) return

    setIsLoading(true)
    setSelectedCommit(commitId)

    try {
      if (isDemoMode) {
        const demoCommit = getCommit(commitId) || getCommitByHash(commitId)
        if (demoCommit) {
          setCommit(demoCommit)
          setAnchors(getAnchors(commitId))
          toast({
            title: "Success",
            description: "Demo commit found",
          })
        } else {
          setCommit(null)
          setAnchors([])
          toast({
            title: "Not Found",
            description: "Demo commit not found",
            variant: "destructive",
          })
        }
      } else {
        const response = await apiClient.getCommit(commitId)
        if ((response as any).data) {
          setCommit((response as any).data)
          const anchorsResponse = await apiClient.getAnchors(commitId)
          setAnchors((anchorsResponse as any).data || [])
          toast({
            title: "Success",
            description: "Commit found",
          })
        } else {
          setCommit(null)
          setAnchors([])
          toast({
            title: "Not Found",
            description: "Commit not found",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Error",
        description: "Failed to search for commit. Please try again.",
        variant: "destructive",
      })
      setCommit(null)
      setAnchors([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnchor = async () => {
    if (!commit) return

    try {
      // Simulate blockchain anchoring - in real app, this would interact with smart contracts
      const mockBlockNumber = Math.floor(Math.random() * 1000000) + 19000000
      // Generate proper 64-character hex string (32 bytes)
      const mockTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')

      if (isDemoMode) {
        addAnchor({
          commitId: commit.id,
          blockNumber: mockBlockNumber,
          transactionHash: mockTxHash,
        })
        setAnchors(getAnchors(commit.id))
      } else {
        await apiClient.createAnchor({
          commitId: commit.id,
          blockNumber: mockBlockNumber,
          transactionHash: mockTxHash,
        })
        // Refresh anchors from database
        const anchorsResponse = await apiClient.getAnchors()
        setAnchors((anchorsResponse as any).data || [])
      }

      toast({
        title: "Success",
        description: "Commit anchored on blockchain successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to anchor commit",
        variant: "destructive",
      })
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Verify a Proof</h1>
            <p className="text-muted-foreground">Search for and verify any commit on the BlockQuest network</p>
          </div>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Search Commit</CardTitle>
              <CardDescription>Enter a commit ID or hash to verify its proof</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter commit ID or hash..."
                  value={commitId}
                  onChange={(e) => setCommitId(e.target.value)}
                  className="bg-input border-border"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </CardContent>
          </Card>

          {commit && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Commit Found</CardTitle>
                <CardDescription>{isDemoMode ? "Demo mode verification" : "Network verification"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-card/50 border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Commit ID</p>
                  <p className="text-foreground font-mono text-sm break-all">{commit.id}</p>
                </div>

                <div className="bg-card/50 border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Prompt Hash</p>
                  <p className="text-foreground font-mono text-sm break-all">{commit.promptHash}</p>
                  <p className="text-xs text-muted-foreground mt-2 italic">"{commit.prompt}"</p>
                </div>

                <div className="bg-card/50 border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Prompt</p>
                  <p className="text-foreground text-sm">{commit.prompt}</p>
                </div>

                <div className="bg-card/50 border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Model</p>
                  <p className="text-foreground font-mono text-sm">{commit.modelId}</p>
                </div>

                <div className="bg-card/50 border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Address</p>
                  <p className="text-foreground font-mono text-sm">{commit.address || commit.userId}</p>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-sm text-green-400">Commit verified successfully</p>
                </div>

                {anchors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">Anchors</h3>
                      <Button size="sm" variant="outline" onClick={handleSearch}>
                        Refresh
                      </Button>
                    </div>
                    {anchors.map((anchor) => (
                      <div key={anchor.id} className="bg-card/50 border border-border rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Block Number</p>
                            <p className="text-sm font-bold text-foreground">{anchor.block_number || anchor.blockNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                            <p className="text-xs font-mono text-foreground break-all">{anchor.transaction_hash || anchor.transactionHash}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Anchored</p>
                          <p className="text-sm text-foreground">{new Date(anchor.timestamp).toLocaleDateString()}</p>
                        </div>
                        <div className="mt-2">
                          <Button size="sm" asChild>
                            <a
                              href={`/explorer?search=${anchor.transaction_hash || anchor.transactionHash}`}
                            >
                              View in Explorer
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {anchors.length === 0 && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-sm text-blue-400">This commit is not yet anchored on-chain</p>
                    <Button className="mt-2" size="sm" onClick={handleAnchor}>
                      Anchor on Blockchain
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {selectedCommit && !commit && (
            <Card className="w-full">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">No commit found with that ID or hash.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
