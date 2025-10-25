"use client"

import { useWallet } from "@/src/contexts/WalletContext"
import { useDemo } from "@/lib/demo-context"
import { RegistrationForm } from "@/components/registration-form"
import { Button } from "@/components/ui/button"

export default function RegisterPage() {
  const { isConnected, connectWallet } = useWallet()
  const { isDemoMode } = useDemo()

  if (!isConnected && !isDemoMode) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center space-y-6 max-w-md">
            <h1 className="text-3xl font-bold text-foreground">Connect Your Wallet</h1>
            <p className="text-muted-foreground">
              You need to connect your wallet to register commits and participate in the BlockQuest ecosystem.
            </p>
            <Button size="lg" onClick={connectWallet}>
              Connect Wallet
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Register a Commit</h1>
            <p className="text-muted-foreground">
              Create a cryptographic proof of your AI model output and anchor it on-chain
            </p>
          </div>
          <RegistrationForm />
        </div>
      </div>
    </main>
  )
}
