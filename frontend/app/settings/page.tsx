"use client"

import { useWallet } from "@/src/contexts/WalletContext"
import { SettingsForm } from "@/components/settings-form"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const { isConnected, connectWallet } = useWallet()

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center space-y-6 max-w-md">
            <h1 className="text-3xl font-bold text-foreground">Connect Your Wallet</h1>
            <p className="text-muted-foreground">Connect your wallet to access settings</p>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-lg text-muted-foreground">Manage your account preferences and security</p>
        </div>
        <div className="flex justify-center">
          <SettingsForm />
        </div>
      </div>
    </main>
  )
}
