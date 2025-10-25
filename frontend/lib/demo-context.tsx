"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useWallet } from "@/src/contexts/WalletContext"

export interface DemoCommit {
  id: string
  promptHash: string
  prompt: string
  modelId: string
  output: string
  address: string
  timestamp: number
  signature: string
}

export interface DemoStake {
  id: string
  commitId: string
  commitHash: string
  prompt: string
  model: string
  amount: string
  prediction: "correct" | "incorrect"
  status: "active" | "resolved" | "expired"
  createdAt: string
  expiresAt: string
}

export interface DemoChallenge {
  id: string
  commitId: string
  commitHash: string
  prompt: string
  challenger: string
  stakeAmount: string
  reason: string
  status: "pending" | "resolved"
  createdAt: string
}

export interface DemoAnchor {
  id: string
  commitId: string
  blockNumber: number
  transactionHash: string
  timestamp: number
}

interface DemoContextType {
  isDemoMode: boolean
  enableDemoMode: () => void
  disableDemoMode: () => void
  commits: DemoCommit[]
  addCommit: (commit: Omit<DemoCommit, "id" | "timestamp">) => Promise<string>
  getCommit: (id: string) => DemoCommit | undefined
  getCommitByHash: (hash: string) => DemoCommit | undefined
  stakes: DemoStake[]
  addStake: (stake: Omit<DemoStake, "id">) => void
  challenges: DemoChallenge[]
  addChallenge: (challenge: Omit<DemoChallenge, "id" | "createdAt">) => void
  respondToChallenge: (challengeId: string) => void
  anchors: DemoAnchor[]
  addAnchor: (anchor: Omit<DemoAnchor, "id" | "timestamp">) => void
  getAnchors: (commitId?: string) => DemoAnchor[]
}

const DemoContext = createContext<DemoContextType | undefined>(undefined)

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false)

  // Check if wallet is connected, but handle case where context might not be available
  let isConnected = false
  try {
    const walletContext = useWallet()
    isConnected = walletContext?.isConnected || false
  } catch (error) {
    // Wallet context not available, assume demo mode
    isConnected = false
  }
  const [commits, setCommits] = useState<DemoCommit[]>([])
  const [stakes, setStakes] = useState<DemoStake[]>([])
  const [challenges, setChallenges] = useState<DemoChallenge[]>([])
  const [anchors, setAnchors] = useState<DemoAnchor[]>([])

  // Update demo mode based on wallet connection
  useEffect(() => {
    setIsDemoMode(!isConnected)
  }, [isConnected])

  // Load demo data from localStorage only when in demo mode
  useEffect(() => {
    if (!isDemoMode) {
      // Clear demo data when not in demo mode
      setCommits([])
      setStakes([])
      setChallenges([])
      setAnchors([])
      return
    }

    const savedCommits = localStorage.getItem("blockquest_demo_commits")
    const savedStakes = localStorage.getItem("blockquest_demo_stakes")
    const savedChallenges = localStorage.getItem("blockquest_demo_challenges")
    const savedAnchors = localStorage.getItem("blockquest_demo_anchors")

    if (savedCommits) {
      try {
        setCommits(JSON.parse(savedCommits))
      } catch (error) {
        console.error("Failed to load demo commits:", error)
      }
    } else {
      // Load sample demo commits only when in demo mode and none exist
      setCommits([
        {
          id: "demo-abc123",
          promptHash: "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
          prompt: "What is the capital of France?",
          modelId: "gpt-3.5-turbo",
          output: "The capital of France is Paris.",
          address: "0x742d35Cc6F3BC14b10b27b5E5A2A7C6E1D3a5B2F",
          timestamp: Date.now() - 86400000, // 1 day ago
          signature: "0x123456789abcdef",
        },
        {
          id: "demo-def456",
          promptHash: "0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
          prompt: "Explain quantum computing in simple terms",
          modelId: "gpt-4",
          output: "Quantum computing uses quantum bits or qubits that can be in multiple states at once...",
          address: "0x742d35Cc6F3BC14b10b27b5E5A2A7C6E1D3a5B2F",
          timestamp: Date.now() - 172800000, // 2 days ago
          signature: "0xabcdef0123456789",
        },
      ])
    }

    if (savedStakes) {
      try {
        setStakes(JSON.parse(savedStakes))
      } catch (error) {
        console.error("Failed to load demo stakes:", error)
      }
    }

    if (savedChallenges) {
      try {
        setChallenges(JSON.parse(savedChallenges))
      } catch (error) {
        console.error("Failed to load demo challenges:", error)
      }
    }

    if (savedAnchors) {
      try {
        setAnchors(JSON.parse(savedAnchors))
      } catch (error) {
        console.error("Failed to load demo anchors:", error)
      }
    }
  }, [isDemoMode])

  // Save all demo data to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("blockquest_demo_commits", JSON.stringify(commits))
  }, [commits])

  useEffect(() => {
    localStorage.setItem("blockquest_demo_stakes", JSON.stringify(stakes))
  }, [stakes])

  useEffect(() => {
    localStorage.setItem("blockquest_demo_challenges", JSON.stringify(challenges))
  }, [challenges])

  useEffect(() => {
    localStorage.setItem("blockquest_demo_anchors", JSON.stringify(anchors))
  }, [anchors])

  const enableDemoMode = () => {
    setIsDemoMode(true)
  }

  const disableDemoMode = () => {
    setIsDemoMode(false)
  }

  const addCommit = async (commit: Omit<DemoCommit, "id" | "timestamp">) => {
    const id = "demo-" + Math.random().toString(36).slice(2, 11)
    const newCommit: DemoCommit = {
      ...commit,
      id,
      timestamp: Date.now(),
    }
    setCommits((prev) => [newCommit, ...prev])
    return id
  }

  const getCommit = (id: string) => {
    return commits.find((c) => c.id === id)
  }

  const getCommitByHash = (hash: string) => {
    return commits.find((c) => c.promptHash === hash)
  }

  const addStake = (stake: Omit<DemoStake, "id">) => {
    const id = "stake-" + Math.random().toString(36).slice(2, 11)
    setStakes((prev) => [{ ...stake, id }, ...prev])
  }

  const addChallenge = (challenge: Omit<DemoChallenge, "id" | "createdAt">) => {
    const id = "challenge-" + Math.random().toString(36).slice(2, 11)
    setChallenges((prev) => [{ ...challenge, id, createdAt: new Date().toISOString().split("T")[0] }, ...prev])
  }

  const respondToChallenge = (challengeId: string) => {
    setChallenges((prev) => prev.map((c) => (c.id === challengeId ? { ...c, status: "resolved" as const } : c)))
  }

  const addAnchor = (anchor: Omit<DemoAnchor, "id" | "timestamp">) => {
    const id = "anchor-" + Math.random().toString(36).slice(2, 11)
    setAnchors((prev) => [{ ...anchor, id, timestamp: Date.now() }, ...prev])
  }

  const getAnchors = (commitId?: string) => {
    if (commitId) {
      return anchors.filter((a) => a.commitId === commitId)
    }
    return anchors
  }

  return (
    <DemoContext.Provider
      value={{
        isDemoMode,
        enableDemoMode,
        disableDemoMode,
        commits,
        addCommit,
        getCommit,
        getCommitByHash,
        stakes,
        addStake,
        challenges,
        addChallenge,
        respondToChallenge,
        anchors,
        addAnchor,
        getAnchors,
      }}
    >
      {children}
    </DemoContext.Provider>
  )
}

export function useDemo() {
  const context = useContext(DemoContext)
  if (!context) {
    throw new Error("useDemo must be used within DemoProvider")
  }
  return context
}
