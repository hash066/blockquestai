"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface VerificationDisplayProps {
  commitId: string
  promptHash: string
  merkleProof?: string[]
}

export function VerificationDisplay({ commitId, promptHash, merkleProof }: VerificationDisplayProps) {
  const [isVerified, setIsVerified] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerify = async () => {
    setIsVerifying(true)
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsVerified(true)
    setIsVerifying(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Proof Verification</CardTitle>
        <CardDescription>Verify the cryptographic proof of this commit</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="bg-card/50 border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Commit ID</p>
            <p className="text-foreground font-mono text-sm break-all">{commitId}</p>
          </div>

          <div className="bg-card/50 border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Prompt Hash</p>
            <p className="text-foreground font-mono text-sm break-all">{promptHash}</p>
          </div>

          {merkleProof && (
            <div className="bg-card/50 border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-2">Merkle Proof Path</p>
              <div className="space-y-1">
                {merkleProof.map((proof, index) => (
                  <p key={index} className="text-foreground font-mono text-xs break-all">
                    {proof}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {isVerified && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-sm text-green-500 font-medium">Proof Verified Successfully</p>
            <p className="text-xs text-green-500/70 mt-1">This commit has been verified on-chain</p>
          </div>
        )}

        <Button onClick={handleVerify} disabled={isVerifying || isVerified} className="w-full">
          {isVerifying ? "Verifying..." : isVerified ? "Verified" : "Verify Proof"}
        </Button>
      </CardContent>
    </Card>
  )
}
