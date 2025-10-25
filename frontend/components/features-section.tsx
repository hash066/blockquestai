export function FeaturesSection() {
  const features = [
    {
      title: "Trust Scoring",
      description: "Earn trust scores based on commit history and challenge resolution",
      icon: "⭐",
    },
    {
      title: "Model Registry",
      description: "Discover and register AI models with verified credentials",
      icon: "📚",
    },
    {
      title: "Staking System",
      description: "Stake on model outputs and earn rewards for correct predictions",
      icon: "💰",
    },
    {
      title: "Challenge Mechanism",
      description: "Dispute claims and resolve conflicts through on-chain arbitration",
      icon: "⚔️",
    },
    {
      title: "Real-time Verification",
      description: "Instant proof verification with Merkle tree visualization",
      icon: "✓",
    },
    {
      title: "Selective Disclosure",
      description: "Share proofs without revealing sensitive prompt information",
      icon: "🔍",
    },
  ]

  return (
    <section className="py-20 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to verify, explore, and stake on AI model outputs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-border bg-background hover:border-primary/50 transition"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
