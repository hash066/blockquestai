"use client"

import { useWallet } from "@/src/contexts/WalletContext"
import { UserProfileComponent } from "@/components/user-profile"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const { isConnected, connectWallet } = useWallet()

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center space-y-6 max-w-md">
            <h1 className="text-3xl font-bold text-foreground">Connect Your Wallet</h1>
            <p className="text-muted-foreground">Connect your wallet to view your profile and statistics</p>
            <Button size="lg" onClick={connectWallet}>
              Connect Wallet
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const mockProfile = {
    address: "0x1234567890123456789012345678901234567890",
    username: "BlockQuestExplorer",
    trustScore: 9.2,
    totalCommits: 156,
    totalStaked: "125,500",
    joinedAt: Date.now() - 86400000 * 90,
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <UserProfileComponent profile={mockProfile} />
      </div>
    </main>
  )
}
