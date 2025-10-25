"use client"

import Link from "next/link"
import { useWallet } from "@/src/contexts/WalletContext"
import { useDemo } from "@/lib/demo-context"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const { isConnected } = useWallet()
  const { enableDemoMode } = useDemo()
  const router = useRouter()

  const handleTryDemo = () => {
    enableDemoMode()
    router.push("/register")
  }

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-background">
      <div className="container mx-auto px-4 text-center py-20">
        <div className="space-y-8 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <span className="text-sm font-semibold text-foreground">v1.0.0</span>
            <span className="text-sm text-muted-foreground">Production Ready</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-foreground text-balance">BlockQuest Explorer</h1>

          <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Prove authorship and origin of AI outputs with cryptographic commitments anchored on-chain
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild className="bg-foreground text-background hover:bg-foreground/90">
              <Link href="/register" className="flex items-center gap-2">
                Register Proof <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/verify">Verify Proof</Link>
            </Button>
            <Button size="lg" variant="ghost" onClick={handleTryDemo}>
              Try Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
