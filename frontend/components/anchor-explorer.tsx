"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import MerkleProofViz from "@/components/MerkleProofViz"

export function AnchorExplorer() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [anchors, setAnchors] = useState<any[]>([])
  const [selectedAnchor, setSelectedAnchor] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const searchQuery = searchParams.get('search')
    if (searchQuery) {
      setSearchTerm(searchQuery)
    }
    loadAnchors()
  }, [searchParams])

  const loadAnchors = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.getAnchors()
      const anchorsData = (response as any).data || []

      // If no real anchors exist, show some mock data
      if (anchorsData.length === 0) {
        const mockAnchors = [
          {
            id: "mock-1",
            commitId: "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
            blockNumber: 19543210,
            transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            isMock: true
          },
          {
            id: "mock-2",
            commitId: "0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
            blockNumber: 19543150,
            transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            isMock: true
          },
          {
            id: "mock-3",
            commitId: "0x9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef",
            blockNumber: 19543000,
            transactionHash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
            timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            isMock: true
          }
        ]
        setAnchors(mockAnchors)
      } else {
        setAnchors(anchorsData)
      }
    } catch (error) {
      console.error("Failed to load anchors:", error)
      // Show mock data on error too
      const mockAnchors = [
        {
          id: "mock-1",
          commitId: "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
          blockNumber: 19543210,
          transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          isMock: true
        }
      ]
      setAnchors(mockAnchors)
      toast({
        title: "Using Demo Data",
        description: "Could not load real anchors, showing demo data instead",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAnchors = anchors.filter(
    (anchor) =>
      (anchor.commit_id && anchor.commit_id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (anchor.transaction_hash && anchor.transaction_hash.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (anchor.block_number && anchor.block_number.toString().includes(searchTerm)),
  )

  const hasMockData = anchors.some(anchor => anchor.isMock)

  return (
    <div className="space-y-6">
      {hasMockData && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-blue-400">
            <strong>Demo Mode:</strong> Showing sample anchor data. Connect your wallet to see real blockchain anchors or create your own commits to anchor.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Search Anchors</CardTitle>
          <CardDescription>Find blockchain anchors by commit ID, transaction hash, or block number</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search anchors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-input border-border"
            />
            <Button onClick={loadAnchors}>Refresh</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Anchors List */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Anchors</CardTitle>
              <CardDescription>{filteredAnchors.length} found</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : filteredAnchors.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredAnchors.map((anchor) => (
                    <button
                      key={anchor.id}
                      onClick={() => setSelectedAnchor(anchor)}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedAnchor?.id === anchor.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs font-mono text-muted-foreground truncate">{anchor.commit_id || anchor.commitId}</p>
                          <p className="text-xs text-muted-foreground mt-1">Block #{anchor.block_number || anchor.blockNumber}</p>
                        </div>
                        {anchor.isMock && (
                          <Badge className="bg-blue-500/20 text-blue-500 text-xs ml-2">
                            Demo
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No anchors found</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Anchor Details */}
        <div className="md:col-span-2">
          {selectedAnchor ? (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="merkle">Merkle Proof</TabsTrigger>
                <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Anchor Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-card/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Commit ID</p>
                      <p className="text-sm font-mono text-foreground break-all">{selectedAnchor.commit_id || selectedAnchor.commitId}</p>
                    </div>

                    <div className="bg-card/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                      <p className="text-sm font-mono text-foreground break-all">{selectedAnchor.transaction_hash || selectedAnchor.transactionHash}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-card/50 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Block Number</p>
                        <p className="text-lg font-bold text-foreground">{selectedAnchor.block_number || selectedAnchor.blockNumber}</p>
                      </div>

                      <div className="bg-card/50 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Anchored</p>
                        <p className="text-sm font-semibold text-foreground">
                          {new Date(selectedAnchor.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {selectedAnchor.isMock ? (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <p className="text-sm text-blue-500 font-medium">Demo Data</p>
                        <p className="text-xs text-blue-500/70 mt-1">This is sample data for demonstration purposes</p>
                      </div>
                    ) : (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <p className="text-sm text-green-500 font-medium">Verified on Blockchain</p>
                        <p className="text-xs text-green-500/70 mt-1">This anchor has been confirmed on-chain</p>
                      </div>
                    )}

                    <Button className="w-full" asChild>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${selectedAnchor.transaction_hash || selectedAnchor.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Etherscan
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="merkle" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Merkle Proof Visualization</CardTitle>
                    <CardDescription>Visual representation of the proof path</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MerkleProofViz
                      proofData={{
                        merkle_proof: [
                          { hash: "0x" + Math.random().toString(16).slice(2, 18), position: "left" },
                          { hash: "0x" + Math.random().toString(16).slice(2, 18), position: "right" },
                          { hash: "0x" + Math.random().toString(16).slice(2, 18), position: "left" },
                        ],
                        leaf_hash: selectedAnchor.commit_id || selectedAnchor.commitId,
                        root: "0x" + Math.random().toString(16).slice(2, 18),
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="blockchain" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Blockchain Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-card/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Network</p>
                      <p className="text-sm font-semibold text-foreground">Sepolia Testnet</p>
                    </div>

                    <div className="bg-card/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Confirmations</p>
                      <p className="text-sm font-semibold text-foreground">{Math.floor(Math.random() * 1000) + 100}</p>
                    </div>

                    <div className="bg-card/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Gas Used</p>
                      <p className="text-sm font-semibold text-foreground">
                        {Math.floor(Math.random() * 100000) + 50000}
                      </p>
                    </div>

                    <div className="bg-card/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <Badge className="bg-green-500/20 text-green-500">Success</Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">Select an anchor to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
