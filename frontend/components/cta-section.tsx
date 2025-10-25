"use client"

import Link from "next/link"
import { useWallet } from "@/src/contexts/WalletContext"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  const { isConnected, connectWallet } = useWallet()

  return (
    <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/10 border-t border-border">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-foreground mb-4">Ready to Explore?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join the BlockQuest community and start verifying AI model outputs today
        </p>

        {isConnected ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Register Your First Commit</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/models">Browse Models</Link>
            </Button>
          </div>
        ) : (
          <Button size="lg" onClick={connectWallet}>
            Connect Wallet to Get Started
          </Button>
        )}
      </div>
    </section>
  )
}
