"use client"

import { ChallengeForm } from "@/components/challenge-form"

export default function ChallengesPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Challenge System</h1>
          <p className="text-lg text-muted-foreground">
            Dispute model outputs and participate in the resolution process
          </p>
        </div>
        <div className="flex justify-center">
          <ChallengeForm />
        </div>
      </div>
    </main>
  )
}
