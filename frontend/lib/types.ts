// BlockQuest Explorer type definitions

export interface Commit {
  id: string
  userId: string
  modelId: string
  promptHash: string
  signature: string
  timestamp: number
  metadata?: Record<string, unknown>
}

export interface Proof {
  commitId: string
  merkleProof: string[]
  leafIndex: number
  verified: boolean
}

export interface Model {
  id: string
  name: string
  description: string
  creator: string
  trustScore: number
  totalCommits: number
  verified: boolean
  createdAt: number
}

export interface Challenge {
  id: string
  commitId: string
  challenger: string
  status: "pending" | "resolved" | "disputed"
  stakeAmount: string
  createdAt: number
}

export interface Anchor {
  id: string
  commitId: string
  blockNumber: number
  transactionHash: string
  timestamp: number
}

export interface UserProfile {
  address: string
  username?: string
  trustScore: number
  totalCommits: number
  totalStaked: string
  joinedAt: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
