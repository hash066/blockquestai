import { StakingDashboard } from "@/components/staking-dashboard"

export default function StakingPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Staking Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Stake on model outputs and earn rewards through correct predictions
          </p>
        </div>
        <StakingDashboard />
      </div>
    </main>
  )
}
