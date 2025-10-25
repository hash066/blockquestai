"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/src/contexts/WalletContext"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface HistoryItem {
  id: string
  type: 'commit' | 'stake' | 'challenge' | 'anchor'
  title: string
  description: string
  hash?: string
  amount?: string
  status: string
  date: string
  details: any
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { address } = useWallet()
  const { toast } = useToast()

  useEffect(() => {
    if (address) {
      loadHistory()
    }
  }, [address])

  const loadHistory = async () => {
    if (!address) return

    setIsLoading(true)
    try {
      const [commitsResponse, stakesResponse, challengesResponse, anchorsResponse] = await Promise.all([
        apiClient.getUserCommits(address),
        apiClient.getUserStakes(address),
        apiClient.getUserChallenges(address),
        apiClient.getAnchors()
      ])

      const commits = (commitsResponse as any).data || []
      const stakes = (stakesResponse as any).data || []
      const challenges = (challengesResponse as any).data || []
      const anchors = (anchorsResponse as any).data || []

      const historyItems: HistoryItem[] = []

      // Add commits
      commits.forEach((commit: any) => {
        historyItems.push({
          id: commit.id,
          type: 'commit',
          title: 'Commit Registered',
          description: `"${commit.prompt}"`,
          hash: commit.prompt_hash || commit.promptHash,
          status: 'Completed',
          date: new Date(commit.timestamp).toLocaleDateString(),
          details: commit
        })
      })

      // Add stakes with commit details
      for (const stake of stakes) {
        let promptText = 'Unknown prompt'
        try {
          const commitResponse = await apiClient.getCommit(stake.commit_id || stake.commitId)
          const commitData = (commitResponse as any).data
          if (commitData && commitData.prompt) {
            promptText = `"${commitData.prompt}"`
          }
        } catch (error) {
          console.error('Failed to fetch commit for stake:', error)
        }

        historyItems.push({
          id: stake.id,
          type: 'stake',
          title: 'Stake Placed',
          description: `${promptText} | Amount: $${stake.amount} | Prediction: ${stake.prediction}`,
          hash: stake.commit_id || stake.commitId,
          amount: stake.amount,
          status: stake.status,
          date: new Date(stake.created_at || stake.createdAt).toLocaleDateString(),
          details: stake
        })
      }

      // Add challenges with commit details
      for (const challenge of challenges) {
        let promptText = 'Unknown prompt'
        try {
          const commitResponse = await apiClient.getCommit(challenge.commit_id || challenge.commitId)
          const commitData = (commitResponse as any).data
          if (commitData && commitData.prompt) {
            promptText = `"${commitData.prompt}"`
          }
        } catch (error) {
          console.error('Failed to fetch commit for challenge:', error)
        }

        historyItems.push({
          id: challenge.id,
          type: 'challenge',
          title: 'Challenge Created',
          description: `${promptText} | Stake: $${challenge.stake_amount || challenge.stakeAmount} | Reason: ${challenge.reason}`,
          hash: challenge.commit_id || challenge.commitId,
          amount: challenge.stake_amount || challenge.stakeAmount,
          status: challenge.status,
          date: new Date(challenge.created_at || challenge.createdAt).toLocaleDateString(),
          details: challenge
        })
      }

      // Add anchors
      anchors.forEach((anchor: any) => {
        historyItems.push({
          id: anchor.id,
          type: 'anchor',
          title: 'Commit Anchored',
          description: `Block: ${anchor.block_number || anchor.blockNumber}`,
          hash: anchor.transaction_hash || anchor.transactionHash,
          status: 'Confirmed',
          date: new Date(anchor.timestamp).toLocaleDateString(),
          details: anchor
        })
      })

      // Sort by date (newest first)
      historyItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setHistory(historyItems)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load history",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Title', 'Description', 'Hash', 'Amount', 'Status']
    const csvContent = [
      headers.join(','),
      ...history.map(item => [
        item.date,
        item.type,
        item.title,
        `"${item.description}"`,
        item.hash || '',
        item.amount || '',
        item.status
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `blockquest-history-${address?.slice(0, 8)}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: "History exported to CSV",
    })
  }

  const getStatusBadge = (status: string, type: string) => {
    const statusColors: Record<string, string> = {
      'active': 'bg-green-500/20 text-green-500',
      'pending': 'bg-yellow-500/20 text-yellow-500',
      'completed': 'bg-blue-500/20 text-blue-500',
      'resolved': 'bg-green-500/20 text-green-500',
      'confirmed': 'bg-green-500/20 text-green-500',
    }

    return (
      <Badge className={statusColors[status.toLowerCase()] || 'bg-gray-500/20 text-gray-500'}>
        {status}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      'commit': 'bg-purple-500/20 text-purple-500',
      'stake': 'bg-blue-500/20 text-blue-500',
      'challenge': 'bg-red-500/20 text-red-500',
      'anchor': 'bg-green-500/20 text-green-500',
    }

    return (
      <Badge className={typeColors[type] || 'bg-gray-500/20 text-gray-500'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Activity History</h1>
          <p className="text-lg text-muted-foreground">
            Your complete BlockQuest activity history and rewards
          </p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Activities</p>
                <p className="text-2xl font-bold text-foreground">{history.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-foreground">
                  ${history.reduce((sum, item) => sum + (parseFloat(item.amount || '0')), 0).toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            Export CSV
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>Your complete history of commits, stakes, and challenges</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : history.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Hash</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-sm">{item.date}</TableCell>
                        <TableCell>{getTypeBadge(item.type)}</TableCell>
                        <TableCell className="font-semibold">{item.title}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.description}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {item.hash ? `${item.hash.slice(0, 10)}...` : '-'}
                        </TableCell>
                        <TableCell className="font-mono">
                          {item.amount ? `$${item.amount}` : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status, item.type)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No activity history found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start by registering a commit or placing a stake!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
